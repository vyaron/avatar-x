# 001 — Editor Page Containers

Status: active
Owner: Yaron Biton
Last updated: 2026-08-17

Backlog item: "Improve the design of the editor page (need some containers)"
(`.plan/000-backlog.md`).

## Goal
Give `.avatar-editor-page` a real layout. Today its children — the preview, the gender
checkbox, the parts menu, three buttons and the credit line — are loose siblings in
document flow, and the preview is `position: fixed` so it floats **over** the rest of the
page instead of sitting beside it. Wrap them in named containers, style those containers
as surfaces, and make the page hold together from 375px up.

Non-goal: no new part, no change to the avatar model, no JS behaviour change.

## Scope
In scope:
- `index.html` — wrapper elements inside `.avatar-editor-page` only.
- `css/avatar-editor.css` — layout and surface rules for the new containers.
- `css/base.css` — new surface/spacing tokens in `:root`.
- `.doc/glossary.md` — one line under `editor` naming the new sub-containers.

Out of scope:
- Any file under `js/`. This change touches **zero JavaScript** (see Assumptions).
- The avatar list page — `.avatar-list` restyling is its own backlog item.
- The `.user-msg` region, `lib/animate.css`, and the part sprites.
- A framework, a bundler, a CSS preprocessor, or any dependency.

## Assumptions
- Every controller selector into this page is a **descendant** selector, so inserting
  wrappers cannot break them. The full list, verified in
  `js/controllers/avatar.controller.js`:
  - `.avatar-editor [data-type="<part>"]` — `changeAvatarPart`, `renderEditor`, `_animateAvatar`
  - `.avatar-editor-page [name="is-male"]` — `renderEditor`
  - `.avatar-editor-page canvas` — `composeAvatarImg`
  - `.avatar-parts-container` and `.avatar-parts-container details` — `renderAvatarParts`,
    `selectAvatarPartSection`
  New wrappers must not sit *between* `.avatar-editor` and its `<img>` layers, and must
  not be placed *inside* `.avatar-parts-container`, whose `innerHTML` the controller
  overwrites on every render.
- The saved PNG is drawn on the 400×400 `<canvas>` at canvas coordinates, independent of
  the preview's CSS size. Scaling the preview responsively does not change the PNG.
- The eight part types and their z-order are unchanged, so **`avatarPartsRenderOrder` in
  `js/services/avatar.service.js` needs no edit** — the invariant holds because the
  `<img>` layer order inside `.avatar-editor` is copied across verbatim, not reordered.
  This is the one thing to re-check in review.

## Open Questions
Answered — all four took the recommendation.

1. **Desktop layout — two columns or one?**
   Recommended: two columns at `min-width: 768px` (preview stage on one side, parts panel
   on the other), single stacked column below that. It removes the long scroll between
   picking a part and seeing it.
   **Answer: two columns, as recommended.**
2. **Should the action bar stick to the bottom of the viewport?**
   Recommended: **no**. `.user-msg` is `position: fixed; bottom: 10px` and would land on
   top of it. Keep the actions in flow at the end of the page.
   **Answer: no, in flow.**
3. **Sticky preview while the parts panel scrolls (desktop only)?**
   Recommended: yes — `position: sticky` on the stage in the two-column layout only.
   **Answer: yes, inside the `@media (min-width: 768px)` block only.**
4. **New container class names.** Recommended: `.editor-layout`, `.editor-stage`,
   `.editor-actions`, `.gender-change`. All are presentational sub-parts of the canonical
   glossary term `editor`; no new domain term is introduced.
   **Answer: `.editor-layout`, `.editor-stage`, `.editor-actions`, `.gender-switch`.**
   This question said `.gender-change` while the Steps markup said `.gender-switch`;
   resolved to `.gender-switch`, matching `avatarService.switchGender`.

## Steps
1. **Tokens** — `css/base.css`, inside the existing `:root` block: add `--surface`,
   `--surface-border`, `--radius`, `--gap`, `--page-max`. No rule outside `:root` may
   hardcode a colour, so `--editor-bg` and `--preview-bg` stay as they are and the new
   panels resolve through `--surface`.
2. **Markup** — `index.html`, inside `.avatar-editor-page`:
   ```
   <div class="editor-layout">
     <div class="editor-stage">
       <div class="avatar-holder avatar-editor"> …the eight <img> layers, order unchanged… </div>
       <label class="gender-switch"> בן? <input name="is-male" …> </label>
     </div>
     <section class="avatar-parts-container"></section>
   </div>
   <div class="editor-actions"> …the three buttons… </div>
   <p class="credit">…</p>
   <canvas width="400" height="400" hidden></canvas>
   ```
   Move the existing nodes; do not retype the layer stack.
3. **Un-fix the preview** — `css/avatar-editor.css`: drop `position: fixed` and `left: 0`
   from `.avatar-editor`; the stage becomes `position: relative` and the layers position
   against it. Drop `z-index: -1` from `.avatar-editor img` — it was only there to escape
   the fixed element's stacking context, and leaving it in would paint the parts behind
   the new stage surface.
4. **Responsive preview** — `.avatar-editor` gets `width: min(400px, 100%)` with
   `aspect-ratio: 1`; the layers go to `width: 100%` with `inset-inline-start: 0` and
   `inset-block-end: 0`. Logical properties only — the document is RTL.
5. **Panel styling** — `.editor-stage` and `.avatar-parts-container` become surfaces
   (`--surface`, `--surface-border`, `--radius`, padding from `--gap`). Style the
   generated `details` / `summary` / `h3` / `ul` as descendants of
   `.avatar-parts-container`; the thumbnail `ul` becomes
   `grid-template-columns: repeat(auto-fill, minmax(90px, 1fr))` with `img { width: 100% }`
   so the fixed 120px thumbs stop overflowing a narrow screen.
6. **Layout** — `.editor-layout` is a single-column grid with `gap: var(--gap)`, becoming
   two columns in a `@media (min-width: 768px)` block; `.avatar-editor-page` gets
   `max-width: var(--page-max)`, `margin-inline: auto`, `padding-inline`.
7. **Action bar** — `.editor-actions` is a wrapping flex row. The `.btn` rule in
   `base.css` is unchanged; only spacing and alignment are new. Confirm `:focus-visible`
   still shows `--focus-ring` against the new surface.
8. **Glossary** — add one line under `editor` in `.doc/glossary.md` listing the
   sub-containers. No architecture change, so `.doc/architecture.md` needs no edit.
9. **Backlog** — tick the item in `.plan/000-backlog.md` and move it to `## DONE`.

## Validation
No test runner exists, so every check is manual. Serve with `npx serve .` and open the
editor from the list page. All checks in a Chromium browser with the console open.

1. **No console errors** across a full pass: create → pick parts → toggle gender →
   על המזל → save → back to list. (Success metric: zero errors.)
2. **AC1 — live preview.** Click a thumbnail in each of the eight sections; the matching
   layer updates immediately and the character still reads correctly front-to-back
   (hair over head, glasses over eyes, boa in front).
3. **AC2 — clear part.** The ✕ on a section removes that layer and the section stays open.
4. **AC3 — one section open.** Opening a section closes the previously open one.
5. **AC4 — gender.** Toggle בן?: head/hair/eye/mouth swap sprite sets, the accessories
   stay, and the parts panel re-renders inside its container (not outside it).
6. **AC5 — random.** על המזל fills every part and re-renders both halves.
7. **AC6 — PNG matches preview.** Save, then compare the list thumbnail with the editor
   preview layer for layer. This is the invariant check — if any layer is missing or
   reordered, stop and re-diff the `<img>` block against `avatarPartsRenderOrder`.
8. **AC11 — 375px.** DevTools at 375×667: no horizontal scrollbar, `document.body.scrollWidth`
   equals the viewport width, the preview is fully visible, and every thumbnail is tappable.
9. **Overlap regression.** At 375px and at 1280px, the preview must not cover the parts
   panel, the buttons, or the credit line — that is the bug this plan exists to fix.
10. **RTL.** Confirm the layout mirrors correctly and nothing is pinned to the wrong edge;
    grep the diff for `left:` / `right:` / `margin-left` / `margin-right` — there should
    be none.
11. **Focus.** Tab through the checkbox, the part sections and the three buttons; the
    focus ring is visible on every stop against the new surfaces.
12. **Animations.** The idle jello/pulse on eyes, hair, mouth and glasses still runs and
    does not shift the layers now that they sit in a relative stage.

## Risks
- **Layer order drift (highest).** Retyping the `<img>` block instead of moving it could
  silently reorder layers, and the preview would then disagree with the saved PNG.
  Mitigation: move the nodes, and diff the block in review against
  `avatarPartsRenderOrder`.
- **`z-index: -1` removal.** The layers currently paint *behind* their own holder. Once
  the stage is a real surface, keeping the negative z-index would hide them. Check
  step 3 and step 5 together, not separately.
- **animate.css transforms.** `animate__animated` applies transforms to absolutely
  positioned layers; a new transform or `overflow: hidden` on the stage could clip or
  reposition them mid-animation. Covered by validation 12.
- **Generated markup.** Everything inside `.avatar-parts-container` is rebuilt by the
  controller, so a CSS rule that assumes a wrapper element there will silently stop
  matching. Style descendants only.
- **Scope creep into the list page.** Shared rules live in the same stylesheet; changing
  `.btn` or `ul` globally would move the list page too. Keep new rules scoped under
  `.avatar-editor-page`.

## Rollout Order
1. Branch `feat/editor-containers` off `master` before any edit (git-workflow rule).
2. Tokens (step 1) — no visible change yet.
3. Markup wrappers (step 2) — page will look wrong between here and step 4; that is
   expected, keep it to one commit boundary.
4. Preview un-fix + responsive preview (steps 3–4). Run validation 2, 7, 9 here — this is
   the risky pair.
5. Panels, layout, action bar (steps 5–7). Run the full validation list.
6. Docs and backlog (steps 8–9).
7. Review pass, then ask for approval to commit and merge. No commit, merge, or tag
   without explicit approval.

## Rollback
Pure presentation, no data touched — saved avatars in `localStorage` are unaffected in
either direction, so rollback needs no migration.
- Before merge: `git checkout master -- index.html css/avatar-editor.css css/base.css`.
- After merge: `git revert` the merge commit. Three files, no JS, no stored state.
- Partial fallback if only the two-column layout misbehaves: delete the
  `@media (min-width: 768px)` block. The single-column layout stands on its own and still
  fixes the overlap.
