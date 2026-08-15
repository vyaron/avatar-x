---
name: writing-plans
description: Create, revise, or supersede an implementation plan in .plan/. Use whenever the user asks for a plan, an approach, or a design doc for a task, or when revising an existing plan after feedback. Defines the .plan/ lifecycle, the NNN-YYYY-MM-DD-topic.md filename, required metadata, and the nine required sections.
---

# Writing Plans

`.plan/` at the repository root is the source of truth for plans. `000-backlog.md`
is the task queue; every other file is a plan.

## Before writing anything
1. Read the existing `.plan/*.md` — do this even when the request names no plan
   file. A new plan must build on decisions already made, not contradict them.
2. Read `.doc/product-definition.md` for acceptance criteria and scope, and
   `.doc/architecture.md` for the module boundaries the plan has to respect.
3. If `.plan/` does not exist, create it.

## Filename
`NNN-YYYY-MM-DD-<topic>.md`, with a sequential numeric prefix — `001`, `002`, `003`.
Example: `.plan/001-2026-08-15-theme-toggle-in-footer.md`.

## Required metadata
Near the top of every plan:

```
Status: draft | active | done | superseded
Owner:
Last updated: YYYY-MM-DD
```

New plans start as `Status: draft`. Only the human approval gate flips a plan to
`active`.

## Required sections
Every plan must contain all nine, in this order:

`Goal` · `Scope` · `Assumptions` · `Open Questions` · `Steps` · `Validation` ·
`Risks` · `Rollout Order` · `Rollback`

## Content rules
- Repository-relative paths only. Never machine-specific absolute paths.
- Never create a `docs/` directory — `.doc/` is the one.
- Respect the stack. This is a no-build, vanilla-JS, client-only app: do not plan
  server work, a database, a framework, a bundler, or a dependency without raising it
  as an `Open Question` and getting approval first.
- `Validation` is the checklist the change is judged against. There is no test runner
  in this repo, so each item must be a concrete, repeatable manual check — the exact
  steps in the browser and the expected result. See the `writing-tests` skill for the
  verification protocol.
- If the plan touches the avatar parts, say explicitly how the preview layer order in
  `index.html` and `avatarPartsRenderOrder` stay in sync.

## Open Questions and approval
- Ask every plan question **inside the plan file**, not in chat.
- Make each question easy to answer, and include a recommended answer.
- Update the plan once answers arrive.
- Request approval before executing the plan.

## Superseding a plan
When a plan is replaced, set the old plan to `Status: superseded` and add a link
to the replacing plan.
