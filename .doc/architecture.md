# System Architecture

## Purpose
- Concise architecture reference for module boundaries, ownership, and the major flows
  of the Avatar Creator.

## Context
- A vanilla-JS avatar builder: pick head, hair, eyes, mouth and accessories, save the
  result, and share it as a PNG.
- **No build step, no framework, no package manager.** The app is plain ES modules loaded
  by the browser, so it must be served over HTTP (`npx serve .`) — `file://` blocks
  module loading.
- There is no server, no API, and no database. `localStorage` is the only persistence.

## System Overview
```
index.html                   both pages (markup)
css/
  main.css                   entry, @imports the rest
  base.css                   design tokens + page basics
  avatar-editor.css          editor + list styles
js/
  app.js                     page switching, window.game API, user-msg toast
  controllers/
    avatar.controller.js     rendering + user actions, owns the in-editor avatar
  services/
    avatar.service.js        avatar model, part catalog, CRUD facade
    async-storage.service.js Promise-based localStorage CRUD
    util.service.js          random int, HTML escaping, animate.css helper
img/avatar/                  part sprites, named <part>_<gender?><n>.png
lib/animate.css              animate.css, used for the idle part animations
```

## Primary Components
- `app.js` — the shell. Owns page switching (`.avatar-editor-page` / `.avatar-list-page`
  toggled via the `hidden` attribute; there is no router and no URL state) and exposes
  `window.game`, the single global that every inline `onclick` in `index.html` reaches
  for. Nothing else may be added to `window`.
- `avatar.controller.js` — the only module that touches the DOM for avatar features.
  Holds `gAvatar`, the avatar currently open in the editor; it carries an `id` only while
  editing a saved avatar. Also owns canvas composition and the animation intervals.
- `avatar.service.js` — the domain. Defines the avatar shape, the part catalog
  (`avatarPartsCount`, Hebrew labels, which parts are gendered), the render order, and
  delegates persistence to the storage service. No DOM access.
- `async-storage.service.js` — generic entity CRUD over `localStorage`, shaped like a
  REST client (`query` / `get` / `post` / `put` / `remove`, all Promise-returning) so a
  real backend could replace it without touching callers.

## Layering
The call direction is fixed and one-way:

```
index.html (inline handler) → window.game → controller → service
```

- The DOM never calls a service directly. Every `window.game` entry points at a
  controller function, so there is always a layer that can catch a failure and surface
  it with `showUserMsg`.
- Controllers own the DOM and the error reporting. Services own logic and data, throw on
  failure, and never touch `document` or `window.game`.
- A service that needs to notify the app takes a callback from its controller rather than
  reaching for the DOM itself.

## Data Model
```js
avatar = {
  id,                 // assigned by async-storage on first save
  name,               // user supplied, escaped before it reaches innerHTML
  gender,             // 'f' | 'm'
  parts: {            // '' means the part is absent
    head, hair, eye, mouth, glasses, accessory, necklace, boa
  },
  img                 // data-URL PNG composed on save
}
```
- Stored under the `avatar` key in `localStorage` as a JSON array.
- `head`, `hair`, `eye`, `mouth` are gendered — their filenames embed `f`/`m`. The rest
  are shared and carry over when the gender is switched.

## Data Flow
- **Edit** — a click on a part thumbnail calls `game.changeAvatarPart(el)`, which swaps
  the `src` of the matching `.avatar-editor [data-type]` layer and records the filename
  in `gAvatar.parts`. The live preview is the DOM; `gAvatar` is the model behind it.
- **Save** — `saveAvatar()` snapshots `gAvatar`, prompts for a name if missing, composes
  the PNG on the hidden `<canvas>`, then `post`s or `put`s through the service. A
  quota failure surfaces a user message instead of throwing.
- **Compose** — `composeAvatarImg()` loads every non-empty part, waits for all of them,
  and only then draws in `getPartsRenderOrder()` order. Drawing per-image as it lands
  would layer by load order and produce a PNG that does not match the preview.
- **List** — `renderAvatars()` clears the animation intervals, queries storage, and
  rebuilds the `<ul>`; each row's PNG is the stored `img`, not a re-composition.
- **Share** — `shareAvatar(id)` refetches the data URL into a `Blob`, wraps it in a
  `File`, and calls `navigator.share`. Feature-detected via `navigator.canShare` — file
  sharing is effectively mobile-only, and an `AbortError` (user cancelled) is not an
  error.

## Layering Invariant
`avatarPartsRenderOrder` in `avatar.service.js` must stay in sync with the order of the
`<img>` layers inside `.avatar-editor` in `index.html`. They are two expressions of the
same z-order — the DOM one drives the preview, the array drives the saved PNG. Changing
one without the other makes saved avatars look different from what the user built.

## Styling
- Tokens are CSS custom properties declared in `:root` in `base.css`. There is a single
  dark palette — every color in the app resolves through a token, and no rule hardcodes
  one. Theme switching was removed; adding it back means redefining tokens only.
- The document is `lang="he" dir="rtl"`; UI copy is Hebrew.

## Auth and Org Boundaries
- None. Single-user, single-device, no accounts, no tenancy, no network calls.

## External Dependencies
- `lib/animate.css` — vendored, no CDN.
- Web Share API — optional, feature-detected.
- Canvas 2D and `localStorage` — required.

## Operational Concerns
- Failures are logged with `console.error` and surfaced through `game.showUserMsg()`,
  the `.user-msg` live region. Never fail silently.
- `localStorage` holds full-size PNGs, so quota is the realistic failure mode after a few
  dozen avatars. `saveAvatar` handles it explicitly.
- Unreadable storage falls back to an empty list rather than crashing the page.
- Animation intervals are cleared before each editor render and on leaving the editor;
  otherwise each render stacks another set on the live ones.
- Avatar names go through `innerHTML`, so they pass `utilService.escapeHtml` first.
- No test harness, linter, or CI exists yet. Verification is manual in the browser.

## Update Triggers
- Update this file when a module is added or its responsibility moves, when the avatar
  data model or storage key changes, when the part render order or catalog changes, or
  when a real backend replaces `async-storage.service.js`.

## Change Log
- 2026-08-15 — Theme switching removed: `theme.controller.js`, `theme.service.js`, the
  toggle, and the pre-paint script are gone. The token system stays, with one dark
  palette.
- 2026-08-15 — Rewritten to describe the actual Avatar Creator codebase; the previous
  version was an unfilled template.
