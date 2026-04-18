"""L1: resolve_active_role priority: env > active-role.yaml > default."""
from __future__ import annotations

import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from runtime import engine  # noqa: E402


def test_env_var_wins(monkeypatch, role):
    monkeypatch.setenv("PODIUM_ROLE", role)
    assert engine.resolve_active_role() == role


def test_active_role_yaml_used_when_no_env(monkeypatch, tmp_repo, role):
    monkeypatch.delenv("PODIUM_ROLE", raising=False)
    active_file = tmp_repo / "agent" / "memory" / "active-role.yaml"
    active_file.parent.mkdir(parents=True, exist_ok=True)
    active_file.write_text(yaml.safe_dump({"role": role}))
    monkeypatch.setattr(engine, "ROOT", tmp_repo)
    assert engine.resolve_active_role() == role


def test_default_fallback_is_agent_architect(monkeypatch, tmp_path):
    monkeypatch.delenv("PODIUM_ROLE", raising=False)
    empty = tmp_path / "empty"
    empty.mkdir()
    monkeypatch.setattr(engine, "ROOT", empty)
    assert engine.resolve_active_role() == "agent-architect"
