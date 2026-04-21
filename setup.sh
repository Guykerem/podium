#!/bin/bash
set -euo pipefail

# setup.sh — Bootstrap script for Podium (v0.2)
#
# Forked from NanoClaw's setup.sh. This is the only bash script in the
# setup flow: it performs preflight checks and hands off to Node/TS step
# modules invoked via `npx tsx setup/<step>.ts`.
#
# Preflight contract (spec/podium-setup-v0.2-decomposition.md §C1):
#   === PODIUM SETUP: BOOTSTRAP ===
#   PLATFORM: macos|linux|wsl|unknown
#   IS_ROOT: true|false
#   NODE_VERSION: <x.y.z>|not_found
#   NODE_OK: true|false
#   DOCKER_PRESENT: true|false
#   DOCKER_RUNNING: true|false
#   TZ: <iana>|unknown
#   CLAUDE_CLI: <path>|missing
#   STATUS: success|node_missing|deps_failed
#   LOG: logs/setup.log
#   === END ===
#
# Exit codes:
#   0 — success (Docker may or may not be present; absence is not an error)
#   1 — deps_failed (optional extras failed; reserved for future use)
#   2 — node_missing (Node ≥20 not found; fatal)

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/setup.log"

mkdir -p "$PROJECT_ROOT/logs"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [bootstrap] $*" >> "$LOG_FILE"; }

# --- Platform detection ---

detect_platform() {
  local uname_s
  uname_s=$(uname -s)
  case "$uname_s" in
    Darwin*) PLATFORM="macos" ;;
    Linux*)  PLATFORM="linux" ;;
    *)       PLATFORM="unknown" ;;
  esac

  IS_WSL="false"
  if [ "$PLATFORM" = "linux" ] && [ -f /proc/version ]; then
    if grep -qi 'microsoft\|wsl' /proc/version 2>/dev/null; then
      IS_WSL="true"
      # Per §C1, wsl collapses PLATFORM into its own value.
      PLATFORM="wsl"
    fi
  fi

  IS_ROOT="false"
  if [ "$(id -u)" -eq 0 ]; then
    IS_ROOT="true"
  fi

  log "Platform: $PLATFORM, WSL: $IS_WSL, Root: $IS_ROOT"
}

# --- Node.js check (≥20) ---

check_node() {
  NODE_OK="false"
  NODE_VERSION="not_found"
  NODE_PATH_FOUND=""

  if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version 2>/dev/null | sed 's/^v//')
    NODE_PATH_FOUND=$(command -v node)
    local major
    major=$(echo "$NODE_VERSION" | cut -d. -f1)
    if [ "$major" -ge 20 ] 2>/dev/null; then
      NODE_OK="true"
    fi
    log "Node $NODE_VERSION at $NODE_PATH_FOUND (major=$major, ok=$NODE_OK)"
  else
    log "Node not found"
  fi
}

# --- Docker detection (optional; absence is not an error) ---

check_docker() {
  DOCKER_PRESENT="false"
  DOCKER_RUNNING="false"

  if command -v docker >/dev/null 2>&1; then
    DOCKER_PRESENT="true"
    if docker info >/dev/null 2>&1; then
      DOCKER_RUNNING="true"
    fi
    log "Docker present=$DOCKER_PRESENT running=$DOCKER_RUNNING"
  else
    log "Docker not present"
  fi
}

# --- Timezone detection (delegated to Node when available) ---

detect_tz() {
  TZ_DETECTED="unknown"
  if [ "$NODE_OK" = "true" ]; then
    # Use Node's Intl API; survive failure silently.
    local out
    if out=$(node -e 'try{const t=Intl.DateTimeFormat().resolvedOptions().timeZone;if(t)process.stdout.write(t);}catch{}' 2>/dev/null); then
      if [ -n "$out" ]; then
        TZ_DETECTED="$out"
      fi
    fi
  fi
  # Environment TZ overrides only if Node resolved nothing.
  if [ "$TZ_DETECTED" = "unknown" ] && [ -n "${TZ:-}" ]; then
    TZ_DETECTED="$TZ"
  fi
  log "Timezone: $TZ_DETECTED"
}

# --- claude CLI check ---

check_claude() {
  CLAUDE_CLI="missing"
  if command -v claude >/dev/null 2>&1; then
    CLAUDE_CLI="$(command -v claude)"
  fi
  log "Claude CLI: $CLAUDE_CLI"
}

# --- Main ---

log "=== Bootstrap started ==="

detect_platform
check_node
check_docker
detect_tz
check_claude

# Resolve status
STATUS="success"
if [ "$NODE_OK" = "false" ]; then
  STATUS="node_missing"
fi

# Emit status block per §C1
cat <<EOF
=== PODIUM SETUP: BOOTSTRAP ===
PLATFORM: $PLATFORM
IS_ROOT: $IS_ROOT
NODE_VERSION: $NODE_VERSION
NODE_OK: $NODE_OK
DOCKER_PRESENT: $DOCKER_PRESENT
DOCKER_RUNNING: $DOCKER_RUNNING
TZ: $TZ_DETECTED
CLAUDE_CLI: $CLAUDE_CLI
STATUS: $STATUS
LOG: logs/setup.log
=== END ===
EOF

log "=== Bootstrap completed: $STATUS ==="

if [ "$NODE_OK" = "false" ]; then
  exit 2
fi
exit 0
