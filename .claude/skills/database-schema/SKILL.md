---
name: database-schema
description: Not applicable to this project — there is no database. Superseded by the client-storage skill. Kept only to redirect requests about tables, columns, migrations, or schema.sql.
---

# Database Schema — not applicable

This project has **no database**, no server, and no `schema.sql`. A backend is
explicitly out of scope in `.doc/product-definition.md`.

Persistence here is `localStorage`. Use the **`client-storage`** skill instead — it
covers the entity shape, the storage keys, the `async-storage.service` contract, and how
to change a stored shape without breaking already-saved avatars.

If a database is ever genuinely introduced, that is an architecture change: it needs a
plan and the user's approval, not this file.
