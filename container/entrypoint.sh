#!/bin/bash
# Podium Agent Container — entrypoint.
#
# Contract:
#   stdin  : JSON object — {"message": "<text>"}  (required)
#   stdout : JSON object — {"text": "...", "latency_ms": N}   (on success)
#            JSON object — {"error": "<code>", "detail": "..."} (on failure)
#   exit   : 0 on success, non-zero on any failure
#
# Volume contract (optional host mounts):
#   /workspace/roles  → /app/roles  (read-only)
#   /workspace/agent  → /app/agent  (read-write; memory seeds persist)
#
# If a host mount is present we symlink it into /app. Otherwise we fall back
# to the shipped defaults baked into the image (/app/roles-default,
# /app/agent-default) so `docker run` with no -v still produces a reply.

set -euo pipefail

# Emit a JSON error to stdout and exit with the given code.
die() {
    local code="$1"
    local detail="$2"
    # Escape double quotes in detail for safe JSON embedding.
    local escaped
    escaped=$(printf '%s' "$detail" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr -d '\n\r')
    printf '{"error":"%s","detail":"%s"}\n' "$code" "$escaped"
    exit 1
}

# --- Wire volume mounts ------------------------------------------------------
# Prefer host-mounted /workspace/<x>; fall back to the baked-in default copy.
setup_overlay() {
    local name="$1"           # "roles" | "agent"
    local mount="/workspace/${name}"
    local target="/app/${name}"
    local fallback="/app/${name}-default"

    # Remove any stale symlink / empty dir left from a previous run.
    if [ -L "$target" ]; then rm -f "$target"; fi
    if [ -d "$target" ] && [ -z "$(ls -A "$target" 2>/dev/null)" ]; then
        rmdir "$target" 2>/dev/null || true
    fi

    if [ -d "$mount" ]; then
        ln -sfn "$mount" "$target"
    elif [ ! -e "$target" ]; then
        # No host mount and no existing /app/<name> — fall back to shipped defaults.
        ln -sfn "$fallback" "$target"
    fi
}

setup_overlay roles
setup_overlay agent

# --- Read & validate stdin ---------------------------------------------------
INPUT_JSON="$(cat || true)"
if [ -z "$INPUT_JSON" ]; then
    die "empty_stdin" "no JSON on stdin; expected {\"message\": \"...\"}"
fi

# Extract .message using node (always present; avoids a jq dep).
MESSAGE="$(
    node -e '
        let data = "";
        process.stdin.on("data", (c) => (data += c));
        process.stdin.on("end", () => {
            try {
                const parsed = JSON.parse(data);
                const m = parsed && typeof parsed.message === "string" ? parsed.message : "";
                process.stdout.write(m);
            } catch (e) {
                process.exit(2);
            }
        });
    ' <<< "$INPUT_JSON" 2>/dev/null
)" || die "bad_json" "could not parse stdin as JSON"

if [ -z "$MESSAGE" ]; then
    die "missing_message" "JSON did not contain a non-empty .message field"
fi

# --- Invoke the engine -------------------------------------------------------
# Runtime resolves the active role from agent/memory/active-role.yaml, which is
# under /app/agent (symlinked above). The engine prints plain text on stdout;
# we wrap it into the JSON response envelope.
cd /app
START_MS=$(node -e 'process.stdout.write(String(Date.now()))')

# Capture stdout separately from stderr so the JSON envelope isn't polluted.
set +e
# Per M3 contract, invoke via `npx tsx`. --no-install keeps it offline-safe
# since tsx is baked in globally (see Dockerfile).
ENGINE_STDOUT="$(npx --no-install tsx runtime/engine.ts --message "$MESSAGE" 2> /tmp/engine.err)"
ENGINE_RC=$?
set -e

END_MS=$(node -e 'process.stdout.write(String(Date.now()))')
LATENCY=$(( END_MS - START_MS ))

if [ $ENGINE_RC -ne 0 ]; then
    ERR_DETAIL="$(cat /tmp/engine.err 2>/dev/null || true)"
    die "engine_failed" "rc=${ENGINE_RC}: ${ERR_DETAIL}"
fi

# Wrap engine text in JSON. Use node to do the escaping safely.
node -e '
    const text = process.argv[1] ?? "";
    const latency = parseInt(process.argv[2] ?? "0", 10);
    process.stdout.write(JSON.stringify({ text, latency_ms: latency }) + "\n");
' "$ENGINE_STDOUT" "$LATENCY"
