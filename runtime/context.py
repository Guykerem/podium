"""Assemble a role's context (identity + skills) into a system prompt string."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _read(p: Path) -> str:
    return p.read_text(encoding="utf-8") if p.exists() else ""


def _list_skills(directory: Path) -> list[tuple[str, str]]:
    """Return (name, description) tuples for SKILL.md files in directory."""
    results = []
    if not directory.exists():
        return results
    for entry in sorted(directory.iterdir()):
        skill_file = entry / "SKILL.md"
        if not skill_file.exists():
            continue
        text = skill_file.read_text(encoding="utf-8")
        description = ""
        if text.startswith("---"):
            end = text.find("\n---", 3)
            if end != -1:
                for line in text[3:end].splitlines():
                    if line.strip().startswith("description:"):
                        description = line.split(":", 1)[1].strip()
                        break
        results.append((entry.name, description))
    return results


def assemble_role_context(role: str) -> str:
    """Build a system-prompt string for a role.

    Sections: shared constitution, role constitution, style, skills list.
    """
    role_dir = ROOT / "roles" / role
    shared_constitution = _read(ROOT / "agent" / "identity" / "constitution.md")
    role_constitution = _read(role_dir / "identity" / "constitution.md")
    shared_style = _read(ROOT / "agent" / "identity" / "style.yaml")
    role_style = _read(role_dir / "identity" / "style.yaml")

    core_skills = _list_skills(ROOT / "agent" / "skills" / "core")
    base_skills = _list_skills(role_dir / "skills" / "base")

    parts = [
        f"# Agent: Podium ({role})",
        "",
        "## Identity",
        shared_constitution.strip(),
        "",
        role_constitution.strip(),
        "",
        "## Style",
        shared_style.strip(),
        "",
        role_style.strip(),
        "",
        "## Available Skills",
        "",
        "### Core (shared across all roles)",
    ]
    for name, desc in core_skills:
        parts.append(f"- **{name}** — {desc}" if desc else f"- **{name}**")
    parts.append("")
    parts.append(f"### Base (specific to {role})")
    for name, desc in base_skills:
        parts.append(f"- **{name}** — {desc}" if desc else f"- **{name}**")
    return "\n".join(parts)
