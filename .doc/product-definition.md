# Product Definition

## Purpose
- Define shared product intent so planning, architecture, and delivery stay aligned.
- This file is the closest thing this repo has to a PRD. Plans in `.plan/` are written
  against it, and delivered work is checked against the acceptance criteria below.

## Product Vision
- A playful avatar creator: pick a head, hair, eyes, mouth and accessories, watch the
  character come together live, name it, save it, and share it as a PNG.
- Small on purpose — plain HTML, CSS, and ES modules, no build step, no accounts, no
  server. It opens instantly and works offline after first load.

## Target Users
- Primary users: kids and casual users making a character for fun.
	- Who they are: Hebrew-speaking, often on a phone, not signed in to anything.
	- What they are trying to accomplish: build an avatar that looks like them (or
	  nothing like them), keep a few, and send one to a friend.
- Secondary users: the course audience and reviewers.
	- Supporting roles and their core needs: read a small, readable vanilla-JS codebase
	  and see clean controller/service separation without framework noise.

## Problem Statement
Avatar makers are either buried inside a larger product that demands an account, or they
are heavyweight apps with far more options than a quick character needs. Someone who just
wants to assemble a face in under a minute — on a phone, in Hebrew, with no signup and no
upload — has no simple option. This app is that: open, build, save, share.

## Value Proposition
- Zero friction — no signup, no install, no network round-trip.
- Live preview: every choice shows up on the character immediately.
- Saved avatars stay on the device; sharing is an explicit, one-tap act.
- RTL Hebrew UI, designed for a phone first.

## Product Scope
- In scope (current phase):
	- Editor with a live layered preview and a collapsible menu per part.
	- Eight part types: head, hair, eye, mouth, glasses, accessory, necklace, boa.
	- Gender switch (`f` / `m`) that reswaps gendered parts and keeps the accessories.
	- Clearing any individual part (the ✕ next to each part section).
	- "על המזל" — a randomized avatar.
	- Save to `localStorage`, including a canvas-composed PNG of the avatar.
	- Saved-avatars list: view, rename-on-edit, re-edit, delete.
	- Share a saved avatar as a PNG file via the Web Share API.
	- Idle animations on eyes, hair, mouth, and glasses.
	- Responsive layout, phone first.
- Out of scope (this phase):
	- Any backend, account, or cross-device sync.
	- Uploading a photo or importing custom art.
	- Backgrounds, colour customisation, or free positioning of parts.
	- A build step, framework, bundler, or TypeScript.

## Acceptance Criteria
Each criterion is verifiable by hand in the browser today; when a test harness is added
(see Constraints) each should become an automated check.

- AC1 — Editor: selecting a thumbnail in any part section updates that layer in the live
  preview immediately, and the preview layering matches the intended z-order.
- AC2 — Clear part: the ✕ on a part section removes that layer from the preview without
  collapsing or reopening the section.
- AC3 — One section open: opening a part section closes the previously open one.
- AC4 — Gender: toggling gender reswaps head, hair, eye, and mouth to the matching sprite
  set, keeps glasses/accessory/necklace/boa as they were, and re-renders the part menu to
  the new gender's thumbnails.
- AC5 — Random: "על המזל" produces a complete avatar, keeps the current name and id, and
  re-renders both the preview and the part menu.
- AC6 — Save: saving an unnamed avatar prompts for a name, writes it to the list, and the
  saved PNG matches the preview layer-for-layer. Saving an avatar opened from the list
  updates that entry rather than creating a duplicate.
- AC7 — List: the list shows every saved avatar with its name and PNG; delete removes
  exactly the targeted avatar; edit reopens it in the editor with its parts and gender
  restored.
- AC8 — Share: on a device that supports file sharing, share opens the OS sheet with a
  PNG named after the avatar. Where it is unsupported, the user is told; cancelling a
  share is silent.
- AC9 — Failure states: a full `localStorage`, a missing avatar, unreadable stored data,
  and a failed share each surface a user msg and never leave the UI silently broken.
- AC10 — Safety: an avatar name containing HTML renders as literal text in the list.
- AC11 — Responsive: the editor and list stay usable at a 375px-wide viewport with no
  horizontal scrolling.

## Success Metrics
- Product metrics:
	- Every journey in Product Scope is reachable in the browser without a console error.
	- All acceptance criteria above pass on the mainline branch.
- Quality metrics:
	- Zero console errors during a full create → save → share → delete pass.
	- No regressions in the preview/PNG layering invariant (see `architecture.md`).

## Constraints and Assumptions
- Stack is fixed for this phase: plain HTML, CSS, and browser-native ES modules. No
  framework, bundler, package manager, or TypeScript. Vendored `lib/animate.css` is the
  only third-party code.
- Must be served over HTTP — ES modules do not load from `file://`.
- `localStorage` is the only persistence: single device, no sync, and a realistic quota
  ceiling of a few dozen full-size PNGs.
- UI copy is Hebrew and the document is RTL.
- There is no test runner, linter, or CI in the repo. Adding automated coverage for the
  criteria above requires standing up a harness first — that is not yet done, and the
  ACs above are manual until it is.
- The storage service deliberately mimics a REST client so a real backend can replace it
  later without reshaping callers.

## Prioritization Rules
- Prioritize work that most improves user outcomes and core metrics.
- Prefer changes that keep the codebase small and dependency-free.
- Defer low-impact features unless required for launch readiness.

## Update Triggers
- Update this file when the part catalog, core user journeys, product scope, acceptance
  criteria, or success metrics change.
