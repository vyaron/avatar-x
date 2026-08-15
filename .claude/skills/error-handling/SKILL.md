---
name: error-handling
description: Design or review how failures are caught, logged, and surfaced to the user. Use when adding a try/catch, handling a localStorage or canvas failure, feature-detecting a browser API, deciding what to tell the user when something goes wrong, or reviewing a failure path. Covers this app's console.error + user-msg convention, the known failure modes, and graceful degradation.
---

# Error Handling

This is a client-only app: no server, no HTTP responses, no status codes. Every failure
is a browser failure, and the only channels are the console (for the developer) and the
user msg (for the user).

## The convention
Every caught failure does both:

```js
try {
    await avatarService.save(avatar)
} catch (err) {
    console.error('Could not save avatar:', err)
    window.game.showUserMsg('לא הצלחתי לשמור')
    return
}
```

- `console.error` with a short English prefix naming the operation, plus the raw `err`.
- `window.game.showUserMsg()` with a short **Hebrew** message for the user.
- `return` early. Never continue into the success path — do not show "שמרתי!" after a
  failed save.

## Who catches what
- **Services throw.** A service does the operation; it does not decide the UX. Do not
  bury a `try/catch` in `js/services/` — that hides the failure from the only layer that
  can report it.
- **Controllers catch and report.** They own the DOM and `showUserMsg`. Every entry on
  `window.game` is a controller function precisely so a failure always has a reporter.
- Report what the user will notice. A failed save of something they asked to save gets a
  user msg; a read that degrades cleanly to a working default gets a log only.

## Principles
- **Never fail silently.** A swallowed `catch` with no user msg is a bug.
- The user msg says what failed in plain language, not why. Technical detail belongs in
  the console.
- Degrade rather than crash: a broken part, an unreadable storage entry, or a missing
  feature should leave the app usable.
- Guard before you mutate. Check that the thing exists first — `remove` throws on a
  missing id specifically because `splice(-1)` would otherwise delete the wrong entity.

## Known failure modes
| Failure | Where | Handling |
|---|---|---|
| `localStorage` quota exceeded | saving an avatar (full-size PNGs) | catch, log, "לא הצלחתי לשמור" — the realistic failure after a few dozen avatars |
| `localStorage` unreadable / corrupt JSON | `storageService.query` | log and return `[]` so the app still loads |
| `localStorage` blocked (private mode) | any write | catch in the controller, log, tell the user what was not saved — the app keeps working for this session |
| Entity not found | `getById`, `remove`, `put` | user msg, and throw from storage so callers cannot proceed on nothing |
| Part sprite fails to load | canvas composition | `_loadImg` resolves `null` instead of rejecting, so one bad part cannot stall the whole save |
| Web Share unsupported | desktop browsers | feature-detect, tell the user — do not call and catch |
| Share cancelled by user | share sheet | `AbortError` is **not** an error. Swallow it silently |

## Feature detection over try/catch
Check for capability before calling an optional browser API:

```js
if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
    window.game.showUserMsg('הדפדפן הזה לא יודע לשתף')
    return
}
```

## Distinguish user intent from failure
An action the user deliberately cancelled is not a failure. Check the error before
reporting it:

```js
if (err.name !== 'AbortError') { /* report */ }
```

## Safety
- User-supplied text (avatar names) reaches `innerHTML`, so it goes through
  `utilService.escapeHtml` first. Treat a missing escape as a defect, not a nicety.
- Never put raw error objects or stack traces into a user msg.

## Verifying a failure path
There is no test runner in this repo yet — see the `writing-tests` skill. Until there
is, check a failure path by hand in the browser and say so in the plan's `Validation`
section: fill `localStorage` to force a quota error, hand-edit a stored value to invalid
JSON, point a sprite at a missing file, and open the share flow on desktop.
