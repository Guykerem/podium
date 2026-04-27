# Workshop

Materials for the lecture's hands-on segment — designing your own role on top of Podium.

## Files

- [`design-template.md`](./design-template.md) — the six-question template. Fill it out before touching any code. Maps directly onto the directory structure of a role: identity, skills, knowledge, memory, schedule, success criteria.
- [`use-cases.md`](./use-cases.md) — worked examples and prompts for finding a real recurring problem worth automating. Read this if you're stuck on "what would I even build?"

## How to use

1. Read `design-template.md`.
2. Open `use-cases.md` if you need inspiration.
3. Pick the `agent-architect` role in `/podium-setup` — it's the role that helps you design and scaffold a new role.
4. Walk through the six questions with the architect; it will write files into a new `roles/<your-role>/` directory.

## See also

- `roles/agent-architect/` — the role that guides this workshop, and itself a worked example of a complete role overlay.
- `roles/tutor/`, `roles/assistant/`, `roles/creator/` — three more reference shapes.
