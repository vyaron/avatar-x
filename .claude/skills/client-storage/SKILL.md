---
name: client-storage
description: Change what this app persists or how. Use when adding or altering a field on the stored avatar, changing a localStorage key, adding a new stored entity, migrating already-saved data to a new shape, or working on the async-storage service. This app has no database — localStorage is the only persistence.
---

# Client Storage

There is no database, no server, and no network. `localStorage` is the only persistence,
and everything in it belongs to one user on one device.

## Source of truth
`js/services/async-storage.service.js` is a generic entity store, deliberately shaped
like a REST client so a real backend could replace it later without touching callers:

| Function | Shape |
|---|---|
| `query(entityType)` | `Promise<entity[]>` |
| `get(entityType, id)` | `Promise<entity \| undefined>` |
| `post(entityType, entity)` | assigns `id`, returns the entity |
| `put(entityType, entity)` | merges over the existing entity, throws if the id is missing |
| `remove(entityType, id)` | throws if the id is missing |

Everything is Promise-returning even though `localStorage` is synchronous. **Keep it that
way** — that async surface is the whole reason a backend could be swapped in later.

Callers never touch `localStorage` directly. They go through a domain service
(`avatar.service.js`), which delegates here.

## Keys in use
| Key | Shape | Written by |
|---|---|---|
| `avatar` | JSON array of avatar entities | `async-storage.service` |

A key is the entity type name, singular — see the naming rule.

## The avatar entity
```js
{
  id,       // 5-char random string, assigned by post()
  name,     // user supplied — escape before it reaches innerHTML
  gender,   // 'f' | 'm'
  parts: { head, hair, eye, mouth, glasses, accessory, necklace, boa },  // '' = absent
  img       // data-URL PNG, composed on save
}
```

## Changing the stored shape
Saved avatars in a user's browser were written by an older version of the code and are
never migrated automatically. So:

- **Additive changes are safe.** A new part or field must be optional, with the reading
  code defaulting it — never assume it is present on a stored entity.
- **Renaming or removing a field breaks existing avatars.** If you must, write an
  explicit migration in the read path that upgrades an old entity in place, and keep it
  until it is safe to drop.
- Never write a migration that can throw on unexpected data. Unreadable storage already
  degrades to an empty list; a migration must degrade at least as gracefully.
- A shape change that makes old avatars unrenderable is a `MAJOR` release — see the
  `cutting-a-release` skill.

## Rules
- Guard before mutating. `put` and `remove` throw on a missing id on purpose:
  `splice(-1)` would silently delete the wrong entity.
- Reads must survive corrupt data — `query` catches, logs, and returns `[]`.
- Writes can fail. Avatars carry full-size PNGs, so quota is the realistic failure after
  a few dozen saves; every write path handles it. See the `error-handling` skill.
- Never store secrets or anything sensitive. This is unencrypted, unscoped, and readable
  by any script on the page.
- Keep entities small where you can. The composed PNG is by far the largest field.

## Verifying a storage change
No test runner exists yet (see `writing-tests`). By hand: save, **reload**, and confirm
the entity round-trips; then load the app with an older stored avatar still in
`localStorage` to prove you did not break existing data.
