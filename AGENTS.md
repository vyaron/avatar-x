# Agent Instructions

## communication with me
- Please start all your responses with Hopa!

## The Project
- **Avatar Creator** — a vanilla-JS avatar builder. Pick head, hair, eyes, mouth and
  accessories, save the result to `localStorage`, share it as a PNG.
- **No build step, no framework, no package manager.** Plain HTML, CSS, and
  browser-native ES modules. There is no `package.json`, no bundler, no TypeScript.
- Serve over HTTP to run it — ES modules do not load from `file://`:
  ```
  npx serve .
  ```
- No backend, no API, no database, no accounts. `localStorage` is the only persistence.
- UI copy is Hebrew; the document is `lang="he" dir="rtl"`.
- Do not introduce a framework, bundler, or dependency without asking first.

## Security
- Never commit or expose secrets (tokens, API keys, passwords, cluster credentials, secret values).
- Anything user-supplied that reaches `innerHTML` goes through `utilService.escapeHtml`.

## Guardrails
- There are **no hooks and no `.claude/settings.json`** in this repo today. Nothing is
  enforced automatically — the rules below are the whole guardrail, so follow them.
- If hooks are added later, `.claude/settings.json` is the only place Claude Code reads
  hook and permission config from, and a hook script not listed there never runs.
- Do not duplicate permission or rule content across agent docs. `AGENTS.md` and
  `.claude/rules/` are canonical; `.cursor/rules/index.mdc` and
  `.github/copilot-instructions.md` are pointers to them and must stay that way.

## Repository Layout
```
index.html          both pages (markup)
css/                main.css (entry) → base.css (tokens) + avatar-editor.css
js/
  app.js            page switching, window.game API, user-msg
  controllers/      avatar.controller.js — DOM rendering + user actions
  services/         avatar, async-storage, util
img/avatar/         part sprites, <part>_<gender?><n>.png
lib/animate.css     vendored animate.css
.doc/               hand-written product and architecture docs
.claude/rules/      always-on constraints, imported below. Short by design.
.claude/skills/     procedural know-how, loaded on demand by task.
.plan/              000-backlog.md is the task queue; NNN-YYYY-MM-DD-*.md are plans.
```
- Never create a `docs/` directory — `.doc/` is the one.

## Rules — always in context
@.claude/rules/code-style.md
@.claude/rules/naming.md
@.claude/rules/ui-and-styling.md
@.claude/rules/git-workflow.md

## Skills — load when the task calls for it
| Skill | Use it when |
|---|---|
| `writing-plans` | Creating, revising, or superseding a plan in `.plan/` |
| `error-handling` | Shaping a failure path or the user-msg text for one |
| `client-storage` | Changing what is persisted, a storage key, or the stored avatar shape |
| `writing-tests` | Adding or reviewing tests, or verifying a change — there is no test harness yet |
| `cutting-a-release` | Choosing a version number or tagging a release |
| `database-schema` | Never — no database here. It only redirects to `client-storage` |

## Product and Domain
- Product definition and acceptance criteria: `.doc/product-definition.md`.
- Architecture overview: `.doc/architecture.md`.
- Canonical domain terms: `.doc/glossary.md` — document a new shared term there
  before using it broadly.
- Keep these docs updated when the avatar data model, the part catalog, the part render
  order, or module responsibilities change.

## Invariants worth knowing before you edit
- `avatarPartsRenderOrder` in `js/services/avatar.service.js` must stay in sync with the
  order of the `<img>` layers in `.avatar-editor` in `index.html`. The DOM order drives
  the live preview, the array drives the saved PNG — change one and saved avatars stop
  matching what the user built.
- `window.game` in `js/app.js` is the single sanctioned global; every inline handler in
  `index.html` reaches for it. Do not add other globals.
- **The DOM never calls a service directly.** The call direction is
  `index.html → window.game → controller → service`, always. Every `window.game` entry
  must point at a controller function, never at a service function — the controller is
  the layer that catches a failure and reports it with `showUserMsg`.
- Controllers touch the DOM and report errors. Services hold logic and data, throw on
  failure, and never reference `document` or `window.game`.
