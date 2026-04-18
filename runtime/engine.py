"""
Podium Runtime Engine — role loader + message dispatcher.

Usage:
    python runtime/engine.py                           # boot summary
    python runtime/engine.py --message "hi"            # send one message
    python runtime/engine.py --message "hi" --dry-run  # print context, no LLM call
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parent.parent


def load_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def resolve_active_role() -> str:
    env_role = os.environ.get("PODIUM_ROLE")
    if env_role:
        return env_role
    active_role_file = ROOT / "agent" / "memory" / "active-role.yaml"
    data = load_yaml(active_role_file)
    if data.get("role"):
        return data["role"]
    return "agent-architect"


def load_agent_config() -> dict[str, Any]:
    identity = load_yaml(ROOT / "agent" / "identity" / "style.yaml")
    autonomy = load_yaml(ROOT / "agent" / "autonomy.yaml")
    program_path = ROOT / "agent" / "program.md"
    return {
        "identity": identity,
        "autonomy": autonomy,
        "has_program": program_path.exists(),
    }


def load_role_overlay(role: str) -> dict[str, Any]:
    role_dir = ROOT / "roles" / role
    if not role_dir.exists():
        return {}
    return load_yaml(role_dir / "role.yaml")


def discover_skills(role: str) -> dict[str, list[str]]:
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

    return {"core": list_skills(core_dir), "base": list_skills(base_dir)}


def load_runtime_configs() -> dict[str, dict[str, Any]]:
    runtime_dir = ROOT / "runtime"
    return {
        "providers": load_yaml(runtime_dir / "providers.yaml"),
        "channels": load_yaml(runtime_dir / "channels.yaml"),
        "scheduler": load_yaml(runtime_dir / "scheduler.yaml"),
    }


def _boot_summary(role: str) -> None:
    agent_cfg = load_agent_config()
    role_overlay = load_role_overlay(role)
    skills = discover_skills(role)
    runtime = load_runtime_configs()

    providers_cfg = runtime["providers"]
    channels_cfg = runtime["channels"]
    scheduler_cfg = runtime["scheduler"]

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
    print(f"  Provider:        {providers_cfg.get('default_provider', 'none')}")
    print(f"  Channel:         {channels_cfg.get('default_channel', 'none')}")
    print(f"  Scheduler:       {'enabled' if scheduler_cfg.get('enabled', False) else 'disabled'}")
    print("=" * 50)
    print("\nEngine stub loaded successfully. Exiting.")


def run_message(message: str, dry_run: bool = False) -> int:
    sys.path.insert(0, str(ROOT))
    from runtime.context import assemble_role_context

    role = resolve_active_role()
    context = assemble_role_context(role)
    if dry_run:
        print(context)
        return 0
    from runtime.llm_client import ClaudeCodeClient
    client = ClaudeCodeClient()
    response = client.complete(context, message)
    print(response.text)
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="podium-engine")
    parser.add_argument("--message", type=str, default=None,
                        help="Send one message to the active role and print the response")
    parser.add_argument("--dry-run", action="store_true",
                        help="With --message, print the assembled context instead of calling the LLM")
    args = parser.parse_args(argv)

    if args.message is not None:
        return run_message(args.message, dry_run=args.dry_run)

    role = resolve_active_role()
    _boot_summary(role)
    return 0


if __name__ == "__main__":
    sys.exit(main())
