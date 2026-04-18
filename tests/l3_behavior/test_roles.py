"""L3: live behavior tests — require `claude` CLI.

Covers the three modify-surface assertions: role identity colors output,
identity edit is observable, skill-add is discoverable and usable.
"""
from __future__ import annotations

import difflib
import os
import subprocess
import sys
import textwrap
from pathlib import Path

import pytest
import yaml

from tests.conftest import ROLES

ROOT = Path(__file__).resolve().parents[2]
PYTHON = sys.executable

ROLE_KEYWORDS = {
    "agent-architect": "design",
    "assistant": "schedule",
    "tutor": "learn",
    "creator": "create",
}


def _run_message(cwd: Path, role: str, message: str, timeout: int = 120) -> str:
    env = os.environ.copy()
    env["PODIUM_ROLE"] = role
    r = subprocess.run(
        [PYTHON, str(cwd / "runtime" / "engine.py"), "--message", message],
        cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout,
    )
    assert r.returncode == 0, f"stdout:\n{r.stdout}\nstderr:\n{r.stderr}"
    return r.stdout


@pytest.mark.live
@pytest.mark.parametrize("role", ROLES)
def test_role_keyword_appears_in_response(tmp_repo, role):
    response = _run_message(tmp_repo, role, "In one sentence: who are you and what do you help with?")
    keyword = ROLE_KEYWORDS[role]
    assert keyword.lower() in response.lower(), \
        f"{role}: expected '{keyword}' in response, got: {response[:300]}"


@pytest.mark.live
@pytest.mark.parametrize("role", ROLES)
def test_identity_edit_changes_response(tmp_repo, role):
    baseline = _run_message(tmp_repo, role, "Say hello in exactly one sentence.")

    style_path = tmp_repo / "roles" / role / "identity" / "style.yaml"
    style = yaml.safe_load(style_path.read_text()) or {}
    if isinstance(style, dict):
        style["warmth"] = "icy-clinical-formal"
        style_path.write_text(yaml.safe_dump(style))
    else:
        style_path.write_text(yaml.safe_dump({"warmth": "icy-clinical-formal"}))

    edited = _run_message(tmp_repo, role, "Say hello in exactly one sentence.")
    ratio = difflib.SequenceMatcher(a=baseline, b=edited).ratio()
    assert ratio < 0.95, \
        f"{role}: identity edit did not change response (ratio={ratio:.3f})"


@pytest.mark.live
@pytest.mark.parametrize("role", ROLES)
def test_skill_add_is_discoverable(tmp_repo, role):
    ping_dir = tmp_repo / "roles" / role / "skills" / "base" / "ping"
    ping_dir.mkdir(parents=True, exist_ok=True)
    skill_md = textwrap.dedent("""\
        ---
        name: ping
        description: When the user says "ping", reply with the single word PING (uppercase).
        ---

        # ping

        Respond with exactly "PING" when the user's message is "ping".
    """)
    (ping_dir / "SKILL.md").write_text(skill_md)

    response = _run_message(tmp_repo, role, "ping")
    assert "PING" in response, \
        f"{role}: newly added 'ping' skill not reflected in response: {response[:300]}"
