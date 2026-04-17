"""
Podium Runtime Engine — minimal bootstrap stub.

Loads agent configuration, role overlay, skills, providers, channels,
and scheduler config, then prints a summary of what's loaded.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Config loaders
# ---------------------------------------------------------------------------

def load_yaml(path: Path) -> dict[str, Any]:
    """Load a YAML file, returning an empty dict if it doesn't exist."""
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def resolve_active_role() -> str:
    """Determine the active role.

    Priority:
      1. PODIUM_ROLE environment variable
      2. agent/memory/active-role.yaml  (field: role)
      3. Default: "agent-architect"
    """
    env_role = os.environ.get("PODIUM_ROLE")
    if env_role:
        return env_role

    active_role_file = ROOT / "agent" / "memory" / "active-role.yaml"
    data = load_yaml(active_role_file)
    if data.get("role"):
        return data["role"]

    return "agent-architect"


def load_agent_config() -> dict[str, Any]:
    """Load core agent configuration from agent/ directory."""
    identity = load_yaml(ROOT / "agent" / "identity" / "style.yaml")
    autonomy = load_yaml(ROOT / "agent" / "autonomy.yaml")
    program_path = ROOT / "agent" / "program.md"
    has_program = program_path.exists()
    return {
        "identity": identity,
        "autonomy": autonomy,
        "has_program": has_program,
    }


def load_role_overlay(role: str) -> dict[str, Any]:
    """Load role-specific overlay from roles/<role>/."""
    role_dir = ROOT / "roles" / role
    if not role_dir.exists():
        return {}
    overlay = load_yaml(role_dir / "role.yaml")
    return overlay


def discover_skills(role: str) -> dict[str, list[str]]:
    """Discover skills from core and role-specific directories.

    Returns dict with 'core' and 'base' skill name lists.
    """
    core_dir = ROOT / "agent" / "skills" / "core"
    base_dir = ROOT / "roles" / role / "skills" / "base"

    def list_skills(directory: Path) -> list[str]:
        if not directory.exists():
            return []
        return sorted(
            entry.name
            for entry in directory.iterdir()
            if entry.is_dir() and not entry.name.startswith(".")
        )

    return {
        "core": list_skills(core_dir),
        "base": list_skills(base_dir),
    }


def load_runtime_configs() -> dict[str, dict[str, Any]]:
    """Load providers, channels, and scheduler configs."""
    runtime_dir = ROOT / "runtime"
    return {
        "providers": load_yaml(runtime_dir / "providers.yaml"),
        "channels": load_yaml(runtime_dir / "channels.yaml"),
        "scheduler": load_yaml(runtime_dir / "scheduler.yaml"),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    role = resolve_active_role()
    agent_cfg = load_agent_config()
    role_overlay = load_role_overlay(role)
    skills = discover_skills(role)
    runtime = load_runtime_configs()

    providers_cfg = runtime["providers"]
    channels_cfg = runtime["channels"]
    scheduler_cfg = runtime["scheduler"]

    default_provider = providers_cfg.get("default_provider", "none")
    default_channel = channels_cfg.get("default_channel", "none")
    scheduler_enabled = scheduler_cfg.get("enabled", False)

    total_skills = len(skills["core"]) + len(skills["base"])

    print("=" * 50)
    print("  Podium Runtime Engine")
    print("=" * 50)
    print(f"  Role:            {role}")
    print(f"  Role overlay:    {'loaded' if role_overlay else 'not found'}")
    print(f"  Agent program:   {'found' if agent_cfg['has_program'] else 'missing'}")
    print(f"  Autonomy:        {'loaded' if agent_cfg['autonomy'] else 'not found'}")
    print(f"  Skills (core):   {len(skills['core'])}")
    print(f"  Skills (base):   {len(skills['base'])}")
    print(f"  Skills (total):  {total_skills}")
    print(f"  Provider:        {default_provider}")
    print(f"  Channel:         {default_channel}")
    print(f"  Scheduler:       {'enabled' if scheduler_enabled else 'disabled'}")
    print("=" * 50)

    # TODO: Initialize LiteLLM completion loop with provider config
    # TODO: Wire up channel I/O (cli, telegram, webhook)
    # TODO: Wire up APScheduler with scheduler config
    # TODO: Enter main event loop

    print("\nEngine stub loaded successfully. Exiting.")


if __name__ == "__main__":
    main()
