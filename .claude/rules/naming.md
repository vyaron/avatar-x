# Naming

Applies to domain entities, services, controllers, files, DOM hooks, and data fields.

## Domain
- Prefer **singular** entity names: `avatar.service.js`, `avatar.controller.js`, and
  `avatar` as the `localStorage` key.
- Use the canonical short term, never a synonym. `part` not `item`/`layer`, `list` not
  `gallery`, `user msg` not `toast`, `gender` values `'f'` / `'m'`.
- Do not introduce a second word for a concept that already has one. Canonical terms
  live in `.doc/glossary.md`; document a new shared term there before using it broadly.

## Files
- Services: `<domain>.service.js` in `js/services/`.
- Controllers: `<domain>.controller.js` in `js/controllers/`.
- Stylesheets are named for what they style (`avatar-editor.css`) and imported from
  `css/main.css`.
- Part sprites: `img/avatar/<part>_<gender?><n>.png` — gender letter only on gendered
  parts, `n` is 1-based.

## Code conventions
These are the existing conventions in this codebase — match them.

- `g` prefix for module-level mutable state: `gAvatar`, `gIntervals`, `gUserMsgTimeout`.
- `_` prefix for module-private functions not on the exported object: `_createAvatar`,
  `_loadImg`, `_animateAvatar`.
- `el` prefix for DOM elements: `elPage`, `elPart`, `elActiveDetails`.
- `str` prefix for HTML strings built for `innerHTML`: `strHTMLs`.
- Each service exports one object named after the file: `avatarService`, `storageService`,
  `utilService`.

## DOM hooks
- Parts are addressed by `data-type="<part>"`, matching the part name exactly. That
  attribute is the contract between `index.html` and the controller — do not rename a
  part without updating both, plus the sprite filenames and `avatarPartsCount`.
- Classes used as JS selectors match the page or component they name: `.avatar-editor`,
  `.avatar-list`, `.avatar-parts-container`, `.user-msg`.
