"""L1: every SKILL.md under core/ and roles/*/skills/ has name + description frontmatter."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _all_skill_files():
    yield from (ROOT / "agent" / "skills" / "core").glob("*/SKILL.md")
    for role_dir in (ROOT / "roles").iterdir():
        if not role_dir.is_dir():
            continue
        yield from (role_dir / "skills" / "base").glob("*/SKILL.md")
        ext = role_dir / "skills" / "extensions"
        if ext.exists():
            yield from ext.glob("*/*/SKILL.md")


def _parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    block = text[3:end].strip()
    result = {}
    for line in block.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            result[k.strip()] = v.strip()
    return result


def test_every_skill_has_name_and_description():
    missing = []
    for skill in _all_skill_files():
        fm = _parse_frontmatter(skill.read_text())
        if not fm.get("name") or not fm.get("description"):
            missing.append(str(skill.relative_to(ROOT)))
    assert not missing, f"SKILL.md files missing frontmatter: {missing}"


def test_skill_count_matches_census():
    count = sum(1 for _ in _all_skill_files())
    assert count >= 80, f"expected >=80 skill files, found {count}"
