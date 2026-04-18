"""L2: engine --message arg parses and assembles context. No live call."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

from tests.conftest import ROLES

PYTHON = sys.executable
ROOT = Path(__file__).resolve().parents[2]


def test_engine_help_mentions_message():
    result = subprocess.run(
        [PYTHON, str(ROOT / "runtime" / "engine.py"), "--help"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "--message" in result.stdout


@pytest.mark.parametrize("role", ROLES)
def test_engine_assembles_context_for_role(tmp_repo, role):
    """Run engine with --dry-run to print the assembled context without calling claude."""
    env = os.environ.copy()
    env["PODIUM_ROLE"] = role
    result = subprocess.run(
        [PYTHON, str(tmp_repo / "runtime" / "engine.py"),
         "--message", "hi", "--dry-run"],
        env=env,
        capture_output=True, text=True,
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "## Identity" in result.stdout
    assert "## Available Skills" in result.stdout
