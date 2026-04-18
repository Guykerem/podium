"""L1: role context assembly."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from runtime.context import assemble_role_context  # noqa: E402


def test_context_includes_role_identity(role):
    ctx = assemble_role_context(role)
    assert "## Identity" in ctx
    assert "## Available Skills" in ctx


def test_context_lists_core_skills(role):
    ctx = assemble_role_context(role)
    for name in ["communicate", "remember", "observe", "schedule", "act"]:
        assert name in ctx, f"core skill '{name}' missing from context for {role}"


def test_context_mentions_role_name(role):
    ctx = assemble_role_context(role)
    assert role in ctx or role.replace("-", " ") in ctx.lower()
