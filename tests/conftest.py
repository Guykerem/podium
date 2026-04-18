"""Shared pytest fixtures and helpers for Podium test suite."""
from __future__ import annotations

import os
import re
import shutil
from pathlib import Path

import pytest

ROLES = ["agent-architect", "assistant", "tutor", "creator"]
ROOT = Path(__file__).resolve().parent.parent


@pytest.fixture(params=ROLES)
def role(request) -> str:
    """Parameterized across all four roles."""
    return request.param


@pytest.fixture
def tmp_repo(tmp_path: Path) -> Path:
    """Copy the repo into tmpdir; tests can mutate freely."""
    dest = tmp_path / "podium"
    shutil.copytree(
        ROOT,
        dest,
        ignore=shutil.ignore_patterns(
            ".git", "__pycache__", "*.pyc", ".pytest_cache",
            ".worktrees", "node_modules", ".venv",
        ),
    )
    return dest


def parse_status_block(name: str, stdout: str) -> dict[str, str]:
    """Parse a NanoClaw-style status block from stdout.

    Blocks look like:
        === PODIUM SETUP: INSTALL ===
        KEY: value
        OTHER: value
        === END ===
    """
    header = f"=== PODIUM SETUP: {name.upper()} ==="
    footer = "=== END ==="
    pattern = re.escape(header) + r"(.*?)" + re.escape(footer)
    match = re.search(pattern, stdout, re.DOTALL)
    if not match:
        raise AssertionError(
            f"Status block '{name}' not found in stdout:\n{stdout}"
        )
    body = match.group(1).strip()
    result = {}
    for line in body.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            result[k.strip()] = v.strip()
    return result


@pytest.fixture
def parse_block():
    """Expose parse_status_block as a fixture for convenience."""
    return parse_status_block


def claude_cli_available() -> bool:
    """Check if `claude` CLI is on PATH."""
    return shutil.which("claude") is not None


def pytest_collection_modifyitems(config, items):
    """Skip @pytest.mark.live tests when claude CLI is absent and PODIUM_LIVE != 1."""
    force_live = os.environ.get("PODIUM_LIVE") == "1"
    have_claude = claude_cli_available()
    if force_live or have_claude:
        return
    skip_live = pytest.mark.skip(reason="live tests require `claude` CLI or PODIUM_LIVE=1")
    for item in items:
        if "live" in item.keywords:
            item.add_marker(skip_live)
