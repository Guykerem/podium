"""L2: verify step runs L1 boot check for active role."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

from tests.conftest import ROLES, parse_status_block

PYTHON = sys.executable


def _run_verify(cwd: Path, extra_env: dict | None = None):
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    return subprocess.run(
        [PYTHON, "-m", "setup", "--step", "verify"],
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
    )


@pytest.mark.parametrize("role", ROLES)
def test_verify_succeeds_for_each_role(tmp_repo, role):
    active_file = tmp_repo / "agent" / "memory" / "active-role.yaml"
    active_file.parent.mkdir(parents=True, exist_ok=True)
    active_file.write_text(yaml.safe_dump({"role": role}))

    result = _run_verify(tmp_repo)
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    block = parse_status_block("verify", result.stdout)
    assert block["ROLE"] == role
    assert block["BOOT_STATUS"] == "success"
    assert int(block["SKILLS_CORE"]) == 5
    assert int(block["SKILLS_BASE"]) >= 5


def test_verify_fails_on_broken_role(tmp_repo):
    active_file = tmp_repo / "agent" / "memory" / "active-role.yaml"
    active_file.parent.mkdir(parents=True, exist_ok=True)
    active_file.write_text(yaml.safe_dump({"role": "does-not-exist"}))

    result = _run_verify(tmp_repo)
    assert result.returncode != 0
    block = parse_status_block("verify", result.stdout)
    assert block["BOOT_STATUS"] == "failed"
