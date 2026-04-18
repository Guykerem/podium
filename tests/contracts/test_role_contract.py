"""The RoleContract: every role passes every assertion.

This is the single parity check. If any role fails any assertion, we know
exactly which flavor broke.
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

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from runtime import engine  # noqa: E402
from tests.conftest import parse_status_block  # noqa: E402

PYTHON = sys.executable

ROLE_KEYWORDS = {
    "agent-architect": ["design", "architect", "agent"],
    "assistant": ["schedule", "calendar", "tasks", "assistant"],
    "tutor": ["learn", "tutor", "study"],
    "creator": ["content", "creator", "script"],
}


# ------- L1 assertions (always run) -------

def test_assertion_1_identity_files_present(role):
    role_dir = ROOT / "roles" / role / "identity"
    assert (role_dir / "constitution.md").exists(), f"{role}: missing constitution.md"
    assert (role_dir / "style.yaml").exists(), f"{role}: missing style.yaml"


def test_assertion_2_base_skills_with_frontmatter(role):
    skills = engine.discover_skills(role)
    assert len(skills["base"]) >= 5, f"{role}: <5 base skills"
    base_dir = ROOT / "roles" / role / "skills" / "base"
    for entry in base_dir.iterdir():
        if not entry.is_dir() or entry.name.startswith("."):
            continue
        skill_md = entry / "SKILL.md"
        text = skill_md.read_text() if skill_md.exists() else ""
        assert text.startswith("---"), f"{role}/{entry.name}: no frontmatter"
        assert "name:" in text and "description:" in text, \
            f"{role}/{entry.name}: incomplete frontmatter"


def test_assertion_3_env_var_resolves_role(monkeypatch, role):
    monkeypatch.setenv("PODIUM_ROLE", role)
    assert engine.resolve_active_role() == role


# ------- L2 assertions (subprocess) -------

def test_assertion_4_setup_exits_zero_end_to_end(tmp_repo, role):
    result = subprocess.run(
        [PYTHON, "-m", "setup", "--step", "install", "--role", role],
        cwd=tmp_repo, capture_output=True, text=True,
    )
    assert result.returncode == 0, f"{role}: install failed\n{result.stdout}\n{result.stderr}"
    verify = subprocess.run(
        [PYTHON, "-m", "setup", "--step", "verify"],
        cwd=tmp_repo, capture_output=True, text=True,
    )
    assert verify.returncode == 0, f"{role}: verify failed\n{verify.stdout}\n{verify.stderr}"


def test_assertion_5_status_blocks_shape(tmp_repo, role):
    install = subprocess.run(
        [PYTHON, "-m", "setup", "--step", "install", "--role", role],
        cwd=tmp_repo, capture_output=True, text=True,
    )
    block = parse_status_block("install", install.stdout)
    assert block["ROLE"] == role
    assert block["STATUS"] == "success"

    verify = subprocess.run(
        [PYTHON, "-m", "setup", "--step", "verify"],
        cwd=tmp_repo, capture_output=True, text=True,
    )
    vblock = parse_status_block("verify", verify.stdout)
    assert vblock["BOOT_STATUS"] == "success"


def test_assertion_6_active_role_persisted(tmp_repo, role):
    subprocess.run(
        [PYTHON, "-m", "setup", "--step", "install", "--role", role],
        cwd=tmp_repo, capture_output=True, text=True, check=True,
    )
    active = yaml.safe_load((tmp_repo / "agent" / "memory" / "active-role.yaml").read_text())
    assert active["role"] == role


# ------- L3 assertions (gated) -------

def _run_message(cwd: Path, role: str, message: str, timeout: int = 120) -> str:
    env = os.environ.copy()
    env["PODIUM_ROLE"] = role
    r = subprocess.run(
        [PYTHON, str(cwd / "runtime" / "engine.py"), "--message", message],
        cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout,
    )
    assert r.returncode == 0, f"{role}: engine --message failed\n{r.stdout}\n{r.stderr}"
    return r.stdout


@pytest.mark.live
def test_assertion_7_role_keyword_in_response(tmp_repo, role):
    resp = _run_message(tmp_repo, role, "In one sentence: who are you and what do you help with?")
    keywords = ROLE_KEYWORDS[role]
    low = resp.lower()
    assert any(k.lower() in low for k in keywords), \
        f"{role}: expected any of {keywords}, got: {resp[:300]}"


@pytest.mark.live
def test_assertion_8_identity_edit_changes_response(tmp_repo, role):
    baseline = _run_message(tmp_repo, role, "Say hello in exactly one sentence.")
    style_path = tmp_repo / "roles" / role / "identity" / "style.yaml"
    style = yaml.safe_load(style_path.read_text()) or {}
    if isinstance(style, dict):
        style["warmth"] = "icy-clinical-formal"
    else:
        style = {"warmth": "icy-clinical-formal"}
    style_path.write_text(yaml.safe_dump(style))
    edited = _run_message(tmp_repo, role, "Say hello in exactly one sentence.")
    ratio = difflib.SequenceMatcher(a=baseline, b=edited).ratio()
    assert ratio < 0.95, f"{role}: identity edit did not change response (ratio={ratio:.3f})"


@pytest.mark.live
def test_assertion_9_skill_add_discoverable(tmp_repo, role):
    ping_dir = tmp_repo / "roles" / role / "skills" / "base" / "ping"
    ping_dir.mkdir(parents=True, exist_ok=True)
    (ping_dir / "SKILL.md").write_text(textwrap.dedent("""\
        ---
        name: ping
        description: When the user says "ping", reply with the single word PING (uppercase).
        ---

        # ping

        Respond with exactly "PING" when the user's message is "ping".
    """))
    resp = _run_message(tmp_repo, role, "ping")
    assert "PING" in resp, f"{role}: ping skill not observed: {resp[:300]}"
