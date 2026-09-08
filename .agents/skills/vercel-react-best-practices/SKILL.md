---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React code, client data fetching, bundle boundaries, or render behavior. Filter the rules for this React/Vite/TanStack Query project; do not apply Next.js or SWR rules by default.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel React Best Practices

Use this skill to review performance-sensitive React changes. Start with
`references/project-routing.md`; it filters the upstream guide for this Vite
client and identifies the Next.js/SWR rules that do not apply here.

## Priority categories

- `async-*`: eliminate avoidable client waterfalls.
- `bundle-*`: keep imports and optional features analyzable.
- `rerender-*`: avoid unnecessary subscriptions, effects, remounts, and eager
  initialization.
- `rendering-*`: preserve correct explicit rendering and only optimize real
  rendering costs.
- `js-*` and `advanced-*`: use only when the measured or obvious hot path
  justifies the added complexity.

The upstream source contains the full rule catalog. The source snapshot and
project filter are recorded in `SOURCE.md`.

## Guardrail

Do not add `memo`, deferred values, dynamic imports, a new cache, or a state
library for speculative performance. A performance change must have a concrete
render, bundle, request, or interaction problem and must preserve the approved
authentication/profile scenarios.

