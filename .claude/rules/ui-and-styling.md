# UI and Styling

## Styling engine
Plain, hand-written CSS. **No Tailwind, no CSS-in-JS, no preprocessor, no build step.**

- `css/main.css` is the entry point and only `@import`s the others. A new stylesheet
  must be imported there.
- `css/base.css` — design tokens and page basics.
- `css/avatar-editor.css` — editor and list styles.
- Do not use inline styles. Set state with a class or a `data-` attribute instead.

## Design tokens
- Every color, and any shared spacing or sizing value, is a CSS custom property.
- Declare tokens in `:root` in `base.css`. There is **one palette** — a dark one. No rule
  outside that `:root` block may hardcode a color; add a token instead.
- There is no theme switching today. Should it come back, it redefines **only the
  tokens** — never duplicate whole rule blocks.
- Use nested CSS only where it improves scoping and readability.

## Markup and RTL
- The document is `lang="he" dir="rtl"`. Use logical properties — `margin-inline-start`,
  `padding-inline`, `inset-inline-end` — not `left` / `right`.
- UI copy is Hebrew. Keep it short and action-oriented.

## Icons and feedback
- Icons are inline text or emoji in the markup — there is no icon library.
- Transient feedback goes through `game.showUserMsg()`, which renders into the
  `.user-msg` live region. It is this project's toast: keep it concise and
  action-oriented, and never let an action fail silently.
- Part animations use the vendored `lib/animate.css` via `utilService.animateCSS`.

## Accessibility
- Keep the `aria-label` / `role` attributes already on the avatar holder and the
  `.user-msg` region in sync when you change their behavior.
- Preserve a visible focus style; `--focus-ring` is the token for it.
