"""L2: status block emission + parsing helpers."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from setup.status import emit_status_block  # noqa: E402
from tests.conftest import parse_status_block  # noqa: E402


def test_emit_status_block_format(capsys):
    emit_status_block("install", status="success", role="tutor", deps_ok="true")
    captured = capsys.readouterr()
    assert "=== PODIUM SETUP: INSTALL ===" in captured.out
    assert "=== END ===" in captured.out
    assert "ROLE: tutor" in captured.out


def test_emit_then_parse_roundtrip(capsys):
    emit_status_block("install", status="success", role="tutor", deps_ok="true")
    captured = capsys.readouterr()
    block = parse_status_block("install", captured.out)
    assert block["STATUS"] == "success"
    assert block["ROLE"] == "tutor"
    assert block["DEPS_OK"] == "true"
