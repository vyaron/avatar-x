# Glossary

## Purpose
- Define canonical domain terms and approved short forms used across code, docs, and
  plans in the Avatar Creator.

## Core Terms
- `avatar`
	- Canonical meaning: one saved character — a gender, a set of parts, a name, and the
	  composed PNG. The only persisted entity.
	- Use: singular in service, controller, and file names (`avatar.service`,
	  `avatar.controller`), and as the `localStorage` key.
- `part`
	- Canonical meaning: one layer of an avatar (`head`, `hair`, `eye`, `mouth`,
	  `glasses`, `accessory`, `necklace`, `boa`).
	- Use: `part`, never `item`, `piece`, or `layer`. An empty string means the part is
	  absent.
- `gendered part`
	- Canonical meaning: a part whose sprite differs by gender — `head`, `hair`, `eye`,
	  `mouth`. Switching gender resets these and carries the rest over.
- `gender`
	- Canonical meaning: `'f'` or `'m'`, the sprite set an avatar draws from.
	- Use: the single-letter short forms only; they are embedded in the sprite filenames.
- `render order`
	- Canonical meaning: bottom-layer-first sequence used to draw parts onto the canvas
	  (`getPartsRenderOrder()`). Distinct from the editor menu order in `avatarParts`.
- `editor`
	- Canonical meaning: the avatar-building page (`.avatar-editor-page`) and its live
	  preview (`.avatar-editor`).
	- Sub-containers are presentational only, not new domain terms: `.editor-layout`
	  (preview beside parts), `.editor-stage` (the preview surface), `.gender-switch`
	  (the בן? checkbox), `.editor-actions` (the buttons).
- `list`
	- Canonical meaning: the saved-avatars page (`.avatar-list-page`).
	- Use: `list`, not `gallery` or `collection`.
- `user msg`
	- Canonical meaning: the transient status message shown via `game.showUserMsg()` in
	  the `.user-msg` live region. This project's toast.
	- Use: `user msg`, not `toast`, `notification`, or `alert`.

## Sprite Naming
- Part sprites are `img/avatar/<part>_<gender?><n>.png` — gender letter only for gendered
  parts, `n` is 1-based (`head_f1.png`, `boa_3.png`).
- `avatarPartsCount` in `avatar.service.js` is the count of available sprites per part.
  Adding sprites means updating that map.

## Naming Alignment
- Keep this glossary aligned with naming decisions in `../.claude/rules/naming.md`.
- If a new domain term is introduced, add it here before broad usage.

## Update Rules
- Add new terms when introducing a new entity, part type, or shared concept.
- Avoid synonyms for existing terms unless explicitly approved and documented here.
