# Integration notes — voting feature

Started: 2026-04-27
Base: main @ 0a2edbf
Feeder branches:
- voting/backend @ 37a6810
- editor/redesign @ 1f3023e
- voting/frontend @ 6bc6e99

This file is removed in the final task — it is scratch.

## Task 5: Publish slot (Plan 2 pattern)

Plan 2 used a literal `<slot id="publish-action"></slot>` element in editor.html (line 112),
placed in the bottom command bar between the Reset and Export buttons.

editor.js mounts via `document.getElementById("publish-action")` followed by `replaceWith()`.
State is accessed via `state.agent` (a module-level object, not a getter function).

auth-modal.js exports:
- `openAuthModal({ initialTab, onSuccess })` — callback-based, returns the dialog element
- `closeAuthModal()` — imperative close

There is no `getCurrentUser` export in auth-modal.js. Auth check goes directly to
`/api/auth/me`. No `showToast` utility in editor — a minimal inline toast is added.
