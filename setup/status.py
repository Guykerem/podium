"""Structured status block emitter, NanoClaw-style."""
from __future__ import annotations


def emit_status_block(name: str, **fields: str) -> None:
    """Print a status block to stdout.

    Keys are upcased; values stringified.
    """
    print(f"=== PODIUM SETUP: {name.upper()} ===")
    for key, value in fields.items():
        print(f"{key.upper()}: {value}")
    print("=== END ===")
