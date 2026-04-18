#!/bin/bash
# setup.sh — Podium bootstrap
# Checks Python, installs runtime + dev deps, emits a status block.
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/setup.log"
mkdir -p "$PROJECT_ROOT/logs"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }

PY="${PYTHON:-python3}"
PY_VERSION=""
PY_OK="false"
DEPS_OK="false"
CLAUDE_CLI="missing"
STATUS="success"

if command -v "$PY" >/dev/null 2>&1; then
  PY_VERSION=$("$PY" -c 'import sys; print(".".join(map(str,sys.version_info[:3])))')
  MAJOR=$("$PY" -c 'import sys; print(sys.version_info[0])')
  MINOR=$("$PY" -c 'import sys; print(sys.version_info[1])')
  if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 10 ]; then
    PY_OK="true"
  fi
fi

if [ "$PY_OK" = "false" ]; then
  STATUS="python_missing"
fi

if [ "$PY_OK" = "true" ]; then
  # If required deps already importable in current Python, we're done.
  if "$PY" -c "import yaml" >/dev/null 2>&1; then
    DEPS_OK="true"
    log "Runtime deps already satisfied"
  else
    # Create a venv at .venv and install into it. Users activate via:
    #   source .venv/bin/activate
    VENV="$PROJECT_ROOT/.venv"
    if [ ! -d "$VENV" ]; then
      log "Creating venv at $VENV"
      "$PY" -m venv "$VENV" >> "$LOG_FILE" 2>&1 || true
    fi
    if [ -x "$VENV/bin/python" ]; then
      log "Installing deps into venv"
      if "$VENV/bin/python" -m pip install -q -r "$PROJECT_ROOT/runtime/requirements.txt" \
             -r "$PROJECT_ROOT/requirements-dev.txt" >> "$LOG_FILE" 2>&1; then
        DEPS_OK="true"
      else
        STATUS="deps_failed"
      fi
    else
      STATUS="deps_failed"
    fi
  fi
fi

if command -v claude >/dev/null 2>&1; then
  CLAUDE_CLI="$(command -v claude)"
fi

cat <<EOF
=== PODIUM SETUP: BOOTSTRAP ===
PYTHON_VERSION: $PY_VERSION
PYTHON_OK: $PY_OK
DEPS_OK: $DEPS_OK
CLAUDE_CLI: $CLAUDE_CLI
STATUS: $STATUS
LOG: logs/setup.log
=== END ===
EOF

if [ "$STATUS" != "success" ]; then
  exit 1
fi
