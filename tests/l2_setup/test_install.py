"""L2: setup install step — deps, claude CLI, role selection, active-role.yaml."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

from tests.conftest import ROLES, parse_status_block

PYTHON = sys.executable


def _run_install(cwd: Path, role: str = "tutor", extra_env: dict | None = None):
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    return subprocess.run(
        [PYTHON, "-m", "setup", "--step", "install", "--role", role],
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
    )


@pytest.mark.parametrize("role", ROLES)
def test_install_succeeds_for_each_role(tmp_repo, role):
    result = _run_install(tmp_repo, role=role)
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    block = parse_status_block("install", result.stdout)
    assert block["STATUS"] == "success"
    assert block["ROLE"] == role
    assert block["DEPS_OK"] == "true"
    assert block["ACTIVE_ROLE_WRITTEN"] == "true"

    active = yaml.safe_load((tmp_repo / "agent" / "memory" / "active-role.yaml").read_text())
    assert active["role"] == role


def test_install_rejects_invalid_role(tmp_repo):
    result = _run_install(tmp_repo, role="tax-preparer")
    assert result.returncode != 0
    block = parse_status_block("install", result.stdout)
    assert block["STATUS"] == "invalid_role"


def test_install_detects_missing_claude_cli(tmp_repo):
    # Shim PATH to exclude any directory containing `claude`
    (tmp_repo / "empty_bin").mkdir(exist_ok=True)
    result = _run_install(
        tmp_repo,
        role="tutor",
        extra_env={"PATH": str(tmp_repo / "empty_bin")},
    )
    assert result.returncode != 0
    block = parse_status_block("install", result.stdout)
    assert block["STATUS"] == "claude_cli_missing"


def test_install_is_idempotent(tmp_repo):
    first = _run_install(tmp_repo, role="tutor")
    assert first.returncode == 0
    second = _run_install(tmp_repo, role="tutor")
    assert second.returncode == 0
    block = parse_status_block("install", second.stdout)
    assert block["ALREADY_CONFIGURED"] == "true"
