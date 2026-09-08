---
name: typescript-review
description: Review TypeScript and React changes in this project before Product Owner acceptance, focusing on strict typing, UI state safety, Supabase boundaries, and scenario evidence. Use for an independent read-only quality pass; do not implement fixes.
---

# TypeScript review

Review the requested change set independently and read-only. Start with the
relevant Product Brief, functional-analysis scenarios, changed files, and their
full surrounding source. Report only findings that are grounded in a concrete
file and line. Use the Vercel composition and React performance project filters
when the change concerns component APIs, effects, rendering, requests, or
bundle boundaries; do not treat them as a mandate to refactor stable code.

## Project safeguards

- Treat TypeScript's strict compiler and ESLint configuration as the baseline;
  do not normalize `any`, unsafe assertions, or disabled rules to silence a
  failure. Generated Supabase types are not handwritten review targets.
- In React, inspect asynchronous event handlers, effect subscriptions and their
  cleanup, loading transitions, retries, and unhandled rejected promises.
  Private profile content must not render while auth state is unresolved or
  after a session ends.
- In Supabase browser code, permit only `VITE_` URL and publishable-key values.
  Service-role operations remain in provisioning or another server-only path.
  Confirm OTP requests cannot create users, app messages do not expose provider
  internals, and a local logout only clears that browser session.
- For profile data, check query keys include the authenticated user identity,
  cached private queries are removed at session transitions, and UI access is
  supported by migration grants and RLS tests rather than UI checks alone.
- Assess tests by approved `SC-*` behaviour, not by files or classes. Require a
  meaningful executable boundary for changed user-visible or security behaviour;
  use the documented quiet npm scripts as validation evidence.

## Output

Review and report on two independent axes:

### Spec

Check missing or partial `SC-*` behavior, incorrect user-visible or security
behavior, and unapproved scope. A production finding must name the scenario or
approved boundary it violates.

### Engineering

Check strict TypeScript, runtime behavior, React state/effect/rendering,
Supabase boundaries, component composition, applicable Vercel performance rules,
tests, and maintainability. Apply the React/Vite/TanStack Query exceptions in
the two Vercel skill `references/project-routing.md` files; Next.js server rules
and SWR-specific guidance are not automatic findings here.

Within each axis, group findings as `[BLOCKING]`, `[SUGGESTION]`, or `[NIT]`.
Each finding names the path and line, the concrete failure or risk, the
violated scenario/rule, and the smallest correction. If no finding remains,
say so separately for both axes and list the reviewed scope and validation
evidence. This is a read-only review: do not edit files.
