---
name: cutting-a-release
description: Version and publish a release. Use when choosing a version number, deciding between MAJOR/MINOR/PATCH, naming a prerelease or build-metadata identifier, writing release notes, or tagging a release. Covers Semantic Versioning and the pre-tag checklist.
---

# Cutting a Release

> Creating a tag, merging, or publishing requires **explicit user approval** every
> time — see the git-workflow rule. This skill describes how to do it once approved.

## What a release is here
There is no `package.json` and nothing is published to a registry. A release is a
**git tag** on a commit, and the site is whatever static files that commit contains.
The tag is the only place the version number lives, so `v1.4.0` is the tag format.

## Semantic Versioning
`MAJOR.MINOR.PATCH`

| Bump | When |
|---|---|
| `MAJOR` | Breaking change — a stored-avatar shape older versions cannot read, or a removed user-facing capability |
| `MINOR` | Backward-compatible feature — new parts, a new editor capability |
| `PATCH` | Backward-compatible fix |

Because avatars live in the user's `localStorage`, a change to the stored avatar shape
is the main thing that makes a release breaking. If old saved avatars would no longer
render, it is a `MAJOR` — say so in the notes and describe what users will see.

## Prerelease and build metadata
- Prerelease identifiers for non-final versions: `1.4.0-alpha.1`, `1.4.0-rc.1`.
- Build metadata for traceability only: `1.4.0+build.20260815`.

## Before tagging
1. The full manual verification pass is clean — create → save → reload → edit → share →
   delete, with no console errors. See the `writing-tests` skill.
2. Release notes summarize user-visible changes and call out any breaking behavior,
   including anything that affects already-saved avatars.
3. The user has explicitly approved the tag.

Only then create the tag.
