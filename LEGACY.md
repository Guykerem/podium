# Legacy — Python v0.1

Podium v0.1 was a Python runtime + pytest suite. v0.2 hard-forks NanoClaw
(Node/TS) and replaces that stack. This file records how to restore v0.1 if
needed.

## What was preserved

- Branch: `legacy/python-v0.1` — exact state of main before the v0.2 cutover.
- Tag: `v0.1-final` — annotated pointer at the same commit.

## Restore v0.1

```
git checkout legacy/python-v0.1
./setup.sh
pytest
```

Or from a fresh clone:

```
git clone <repo> podium-v0.1
cd podium-v0.1
git checkout v0.1-final
```

## Why we forked

See `spec/podium-setup-v0.2.md` §1 and §2. Short version: v0.1 installed a
generic agent; v0.2 personalizes during install by adopting NanoClaw's
installer pattern end-to-end.
