# Podium Agent Container (M3)
#
# Forked from NanoClaw (~/git/ally-references/references/nanoclaw/container/Dockerfile).
# Strips NanoClaw-specific bits (Chromium, agent-browser, WhatsApp) and wires the
# entrypoint to Podium's TypeScript runtime (runtime/engine.ts).
#
# Build:
#   bash container/build.sh
#
# Run (volume contract — see container/README.md):
#   /workspace/roles  → roles/  (read-only)   [host mount]
#   /workspace/agent  → agent/  (read-write)  [host mount; memory seeds persist]
#
#   echo '{"message":"hi"}' | docker run -i --rm \
#     -v $(pwd)/roles:/workspace/roles:ro \
#     -v $(pwd)/agent:/workspace/agent \
#     podium-agent:latest
#
# Credentials:
#   The `claude` CLI inside the container reads ~/.claude.json / ANTHROPIC_API_KEY.
#   For host-parity, pass the key via `-e ANTHROPIC_API_KEY=...` or mount the
#   host's credentials dir to `/home/node/.claude` (read-only). See README.md.

FROM node:22-slim

# System deps kept minimal. `git` for potential role overlays; `curl` for
# healthchecks / claude CLI auth flows; `ca-certificates` for TLS.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install claude CLI + tsx globally so we don't pay the node_modules bootstrap
# cost on every container run. `tsx` is the same pinned version the host uses.
RUN npm install -g @anthropic-ai/claude-code@latest tsx@4.19.0

WORKDIR /app

# Copy package manifests first so the npm install layer caches well.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy source trees the engine needs. These are shipped as fallback defaults;
# the entrypoint prefers host mounts at /workspace/roles and /workspace/agent
# when present (see volume contract above).
COPY tsconfig.json ./
COPY runtime/ ./runtime/
COPY setup/ ./setup/
COPY agent/ ./agent-default/
COPY roles/ ./roles-default/

# Entrypoint lives outside /app source dirs so it can't be accidentally
# overwritten by a volume mount on /app/runtime.
COPY container/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Writable scratch for the entrypoint (symlinks, stdin buffer).
RUN mkdir -p /workspace /app/agent /app/roles \
    && chown -R node:node /workspace /app

# Non-root execution (required by claude CLI --dangerously-skip-permissions
# parity with NanoClaw).
USER node

# Entry point reads JSON from stdin, writes JSON to stdout.
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
