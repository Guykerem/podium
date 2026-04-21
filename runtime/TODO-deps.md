# Runtime dependencies (M2)

The M2 module (runtime port to TypeScript) needs the following packages in the
root `package.json`. M1 is already introducing `yaml`, `tsx`, `typescript`,
`@types/node`, and `vitest`; the M2 port only depends on that exact set.

## Required (runtime)

- `yaml` — for parsing YAML configs (`providers.yaml`, `channels.yaml`,
  `scheduler.yaml`, `active-role.yaml`) and memory frontmatter.

## Required (dev / tooling)

- `tsx` — for `npx tsx runtime/engine.ts` invocation.
- `typescript` — for `tsc` type-checks (not emitted, only used by tsx + vitest).
- `@types/node` — Node stdlib typings (`fs`, `path`, `child_process`, `os`).
- `vitest` — test runner for `runtime/__tests__/context.test.ts`.

## package.json scripts (suggested additions for the integrator)

```json
{
  "scripts": {
    "engine": "tsx runtime/engine.ts",
    "test:runtime": "vitest run runtime/__tests__"
  }
}
```

## tsconfig.json expectations

M1 is expected to ship a root `tsconfig.json` with:

- `"target": "ES2022"` or newer
- `"module": "NodeNext"` / `"moduleResolution": "NodeNext"`
  (the port uses `import` with plain relative paths and relies on tsx for ESM)
- `"esModuleInterop": true`
- `"strict": true`

If M1 picks CommonJS instead, the runtime port still works — it uses
`import.meta.url` with a `__dirname` fallback, so both module systems resolve
the repo root correctly.

## Notes

- No new deps beyond what M1 already requests.
- `claude` CLI is a runtime dependency of `ClaudeCodeClient`, but it's checked
  for at construction time and not bundled. If absent, `--message` will error
  with a clear message; `--dry-run` works regardless.
