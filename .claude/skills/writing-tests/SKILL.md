---
name: writing-tests
description: Write or review tests, or verify a change without a test runner. Use when adding coverage for a feature, writing a regression check for a bug fix, deciding what is worth testing, or judging whether a change is verified well enough to ship. Covers the fact that this repo has no test harness, the manual verification protocol, and what to cover first if a harness is added.
---

# Writing Tests

## Read this first: there is no test harness
This repo has **no test runner, no `package.json`, and no CI**. There is nothing to run.

Do not write test files that cannot execute, and do not install a runner on your own
initiative — adding a dependency and a build step is a real change to this project's
character and needs the user's approval first (see `AGENTS.md`).

So, when asked to "add tests":
1. Say plainly that no harness exists.
2. Offer to stand one up as its own task, with a recommendation (below).
3. Meanwhile, verify the change with the manual protocol below and record it in the
   plan's `Validation` section.

## Manual verification protocol
Until a runner exists, this is what "tested" means here. Be specific — a `Validation`
item must name the steps and the expected result, so someone else can repeat it.

- Serve the app (`npx serve .`) and exercise the changed journey end to end.
- Check the console: **zero errors** during a full create → save → share → delete pass.
- Re-run the journey after a reload, to prove what persisted actually persisted.
- Exercise the failure path too, not just the happy path — see the `error-handling`
  skill for how to force each known failure.
- For anything visual, check at a 375px-wide viewport.

## What to cover first, if a harness is added
The services are pure and dependency-light, so they are the cheap, high-value target:

- `avatar.service.switchGender` — gendered parts reset, accessories carry over.
- `avatar.service.getRandomAvatar` — always a valid avatar; the last sprite of each part
  is reachable (the `+1` on the exclusive max).
- `avatar.service.getAvatarImgsMap` — sprite counts and gender letters per part.
- `async-storage.service` — full CRUD against a `localStorage` stub, including the
  not-found guards in `put` and `remove` (a missing id must throw, never `splice(-1)`).
- `util.service.escapeHtml` — every entity in the map, and a name containing markup.
- **The layering invariant** — `getPartsRenderOrder()` matches the `<img>` order inside
  `.avatar-editor` in `index.html`. This one is worth a test precisely because nothing
  else catches it.

Controller and DOM behavior needs a real DOM, so it costs more; treat it as a second
stage after the services.

### Recommendation if asked to choose
Vitest with a jsdom environment, as a devDependency only. It runs the service tests with
almost no config and does not impose a bundler or a build step on the app itself. Get
approval before installing it.

## Principles (for whenever tests do exist)
- Test **behavior**, not implementation details.
- Deterministic and isolated: no shared mutable state, no reliance on execution order.
- Freeze or stub randomness and time — `getRandomAvatar` and `_makeId` both use
  `Math.random`.
- Clear setup → action → assertion phases, with names stating the expected behavior.
- Every bug fix gets a regression check that fails before the fix and passes after.
- When a test fails, fix the code — not the test.
