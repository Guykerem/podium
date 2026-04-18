"""Podium setup CLI.

Usage:
    python -m setup --step install [--role ROLE]
    python -m setup --step verify
"""
from __future__ import annotations

import argparse
import sys


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m setup")
    parser.add_argument("--step", choices=["install", "verify"], required=True)
    parser.add_argument("--role", default=None, help="Role to activate (install only)")
    args = parser.parse_args(argv)

    if args.step == "install":
        from setup.steps import install
        return install.run(role=args.role)
    if args.step == "verify":
        from setup.steps import verify
        return verify.run()
    parser.error(f"unknown step: {args.step}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
