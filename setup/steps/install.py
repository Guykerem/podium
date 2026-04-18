"""Install step — verify deps, claude CLI, write active-role.yaml."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import yaml

from setup.status import emit_status_block

VALID_ROLES = ["agent-architect", "assistant", "tutor", "creator"]
ROOT = Path(__file__).resolve().parents[2]


def _check_python() -> tuple[str, bool]:
    version = ".".join(map(str, sys.version_info[:3]))
    ok = sys.version_info >= (3, 10)
    return version, ok


def _check_pyyaml() -> bool:
    try:
        import yaml  # noqa: F401
        return True
    except ImportError:
        return False


def _check_claude_cli() -> tuple[str | None, bool]:
    path = shutil.which("claude")
    if not path:
        return None, False
    try:
        r = subprocess.run(
            [path, "--version"], capture_output=True, text=True, timeout=5
        )
        return path, r.returncode == 0
    except (subprocess.TimeoutExpired, OSError):
        return path, False


def run(role: str | None = None) -> int:
    python_version, python_ok = _check_python()
    deps_ok = _check_pyyaml()

    if not python_ok or not deps_ok:
        emit_status_block(
            "install",
            python_version=python_version,
            deps_ok=str(deps_ok).lower(),
            status="deps_failed",
        )
        return 2

    claude_path, claude_ok = _check_claude_cli()
    if not claude_path:
        emit_status_block(
            "install",
            python_version=python_version,
            deps_ok="true",
            claude_cli="missing",
            status="claude_cli_missing",
        )
        return 3

    if role is None:
        role = "agent-architect"

    if role not in VALID_ROLES:
        emit_status_block(
            "install",
            python_version=python_version,
            deps_ok="true",
            claude_cli=claude_path,
            role=role,
            status="invalid_role",
        )
        return 4

    active_file = ROOT / "agent" / "memory" / "active-role.yaml"
    already_configured = False
    if active_file.exists():
        existing = yaml.safe_load(active_file.read_text()) or {}
        if existing.get("role") == role:
            already_configured = True

    active_file.parent.mkdir(parents=True, exist_ok=True)
    active_file.write_text(yaml.safe_dump({"role": role}))

    emit_status_block(
        "install",
        python_version=python_version,
        deps_ok="true",
        claude_cli=claude_path,
        claude_auth_ok=str(claude_ok).lower(),
        role=role,
        active_role_written="true",
        already_configured=str(already_configured).lower(),
        status="success",
    )
    return 0
