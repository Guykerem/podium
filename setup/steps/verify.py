"""Verify step — runs L1 boot check and emits status block."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from runtime import engine  # noqa: E402
from setup.status import emit_status_block  # noqa: E402

VALID_ROLES = ["agent-architect", "assistant", "tutor", "creator"]


def run() -> int:
    # Ensure engine resolves ROOT relative to CWD-of-invocation for testability.
    engine.ROOT = ROOT

    role = engine.resolve_active_role()
    if role not in VALID_ROLES:
        emit_status_block(
            "verify",
            role=role,
            boot_status="failed",
            reason="unknown_role",
            status="boot_failed",
        )
        return 2

    role_dir = ROOT / "roles" / role
    if not role_dir.exists():
        emit_status_block(
            "verify",
            role=role,
            boot_status="failed",
            reason="role_dir_missing",
            status="boot_failed",
        )
        return 2

    skills = engine.discover_skills(role)
    core = len(skills["core"])
    base = len(skills["base"])

    if core == 0 or base == 0:
        emit_status_block(
            "verify",
            role=role,
            skills_core=str(core),
            skills_base=str(base),
            boot_status="failed",
            reason="no_skills_found",
            status="boot_failed",
        )
        return 2

    emit_status_block(
        "verify",
        role=role,
        skills_core=str(core),
        skills_base=str(base),
        boot_status="success",
        status="success",
    )
    return 0
