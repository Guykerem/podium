"""L1: test runtime.engine config loaders against real repo structure."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from runtime import engine  # noqa: E402


def test_load_agent_config_returns_identity_and_autonomy():
    cfg = engine.load_agent_config()
    assert "identity" in cfg
    assert "autonomy" in cfg
    assert "has_program" in cfg
    assert cfg["has_program"] is True, "agent/program.md must exist"


def test_discover_skills_returns_core_and_base(role):
    skills = engine.discover_skills(role)
    assert set(skills.keys()) == {"core", "base"}
    assert len(skills["core"]) == 5, "expected 5 core skills"
    assert len(skills["base"]) >= 5, f"{role} needs >=5 base skills, got {len(skills['base'])}"


def test_load_role_overlay_handles_missing_role_yaml(role):
    overlay = engine.load_role_overlay(role)
    assert isinstance(overlay, dict)


def test_load_runtime_configs_returns_three_sections():
    runtime = engine.load_runtime_configs()
    assert set(runtime.keys()) == {"providers", "channels", "scheduler"}
    assert runtime["providers"].get("default_provider") is not None
