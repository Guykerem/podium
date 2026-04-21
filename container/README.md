# Podium Container

Docker runtime for the Podium agent. Forked from NanoClaw's container layer
(`~/git/ally-references/references/nanoclaw/container/`), stripped of
Chromium / browser automation / WhatsApp code, and wired to invoke Podium's
TypeScript runtime (`runtime/engine.ts`).

## Files

- `Dockerfile` — base `node:22-slim`, installs `@anthropic-ai/claude-code` +
  `tsx` globally, copies `runtime/`, `setup/`, shipped `agent/`, `roles/`
  into the image as fallback defaults. Runs as non-root `node` user.
- `entrypoint.sh` — reads JSON `{"message": "..."}` from stdin, invokes
  `npx tsx runtime/engine.ts --message <text>`, emits JSON
  `{"text": "...", "latency_ms": N}` on stdout. Non-zero exit on failure with
  `{"error": "<code>", "detail": "..."}` JSON body.
- `build.sh` — wraps `docker build -t podium-agent:latest -f container/Dockerfile .`

## Build

From the repo root:

```sh
bash container/build.sh                      # podium-agent:latest
CONTAINER_RUNTIME=podman bash container/build.sh v0.2   # podman alt, custom tag
```

## Volume contract

The runtime reads `agent/memory/active-role.yaml` to resolve the active role
and the role's `memory/context.md` for seeded onboarding answers. These live
on the host, not in the image, so you mount them at runtime:

| Host path            | Container path        | Mode | Why                                    |
|----------------------|-----------------------|------|----------------------------------------|
| `./roles`            | `/workspace/roles`    | `ro` | Role overlays — shipped source; no writes from the container. |
| `./agent`            | `/workspace/agent`    | `rw` | Shared skeleton + memory — onboarding writes here during install. |

At startup the entrypoint symlinks `/workspace/roles → /app/roles` and
`/workspace/agent → /app/agent` if the mounts are present. Otherwise it falls
back to the defaults baked into the image at `/app/roles-default` and
`/app/agent-default`.

## Run

### With mounts (typical install use)

```sh
echo '{"message":"Say hi in one word"}' | docker run -i --rm \
  -v "$(pwd)/roles:/workspace/roles:ro" \
  -v "$(pwd)/agent:/workspace/agent" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  podium-agent:latest
```

Expected response:

```json
{"text":"Hi.","latency_ms":2412}
```

### Without mounts (smoke test using baked defaults)

```sh
echo '{"message":"Who are you?"}' | docker run -i --rm \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  podium-agent:latest
```

This uses the `agent-architect` default shipped with the image — useful for a
quick build-sanity check before the host has run `/podium-setup`.

## Claude CLI credentials

The `claude` CLI is baked into the image (`@anthropic-ai/claude-code`, installed
globally during build) so the runtime does not depend on a host-installed CLI.
It still needs **credentials at runtime**. Pick one of:

1. **API key via env** (simplest, CI-friendly):
   ```sh
   -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
   ```

2. **Mount the host's claude config** (for already-authenticated devs):
   ```sh
   -v "$HOME/.claude:/home/node/.claude:ro"
   ```

   This shares your Claude Code login with the container. Read-only is safer;
   use `:rw` if you want the container to refresh tokens in place.

3. **Per-run token file** (used by M8 install step): write a short-lived
   credential to a tempdir and mount it.

If neither a key nor a config mount is present, `runtime/engine.ts` will throw
`` `claude` CLI not found on PATH `` on the first real call (but `--dry-run`
still works for build/wiring verification).

## Non-root execution

The image switches to `node:node` (uid/gid 1000:1000) before `ENTRYPOINT`. This
matches NanoClaw's pattern and is required if we ever enable the claude CLI's
`--dangerously-skip-permissions` flag. Mounted volumes should be writable by
uid 1000 on the host (true by default on macOS Docker Desktop; on Linux add
your user to the `docker` group or tweak the mount with `:Z` / `:z`).

## Image size target

Base `node:22-slim` (~200 MB) + `claude-code` + `tsx` + the Podium source
trees keeps us well under the 1.2 GB ceiling set in M3's success criteria.
Expected range: **450-700 MB**. If the image grows past 1 GB, audit the
global `npm install -g` layer — that's where NanoClaw crept up.

## Integration with M8 (install step)

The install step (separate session, depends on M3 output) will:

1. Check `DOCKER_RUNNING` from the BOOTSTRAP status block.
2. If Docker is present, invoke `bash container/build.sh` and record
   `RUNTIME: docker` + `IMAGE: podium-agent:latest` in the INSTALL block.
3. If Docker is absent, fall back to `npm install` + native `tsx`.

Re-runs of `build.sh` are safe — Docker's layer cache handles everything
except source tree edits, which is the exact change-detection we want.
