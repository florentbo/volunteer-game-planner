# Vercel frontend skills integration

## Scope

This project uses two project-local skills from Vercel's `agent-skills`
repository:

- `vercel-composition-patterns` for component API, composition, and shared-state
  boundaries.
- `vercel-react-best-practices` for concrete React client rendering, effects,
  requests, and bundle concerns.

Both are pinned to commit
`063bee94c3f4df8453406c830b0a7df0f2860278` and carry their provenance and
license records beside their entrypoints. The copied entrypoints are adapted
only to add project routing and guardrails; the upstream commit remains the
reference for detailed rule text.

## Applicability decisions

This is a React 19 + Vite + TanStack Query + Supabase browser client.

- Apply client-side `async-*`, relevant `bundle-*`, `rerender-*`, and
  `rendering-*` rules when they describe an actual issue.
- Keep TanStack Query as the approved query/cache boundary. The upstream SWR
  rule is not a migration instruction.
- Skip Next.js server actions, RSC/server-cache, SSR hydration, and other
  server-only rules unless the architecture changes and the Product Owner
  approves that scope.
- React 19 permits `ref` as a regular prop, but `useContext` remains a valid
  React API. No mechanical context migration is warranted for this milestone.
- Do not add `memo`, providers, compound components, dynamic imports, or a new
  state library without a concrete behavior, render, request, or bundle problem.

## Routing examples

| Request                                    | Route                                                   | Expected handling                                                                                     |
| ------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| “The login component has many mode flags.” | Composition                                             | Consider explicit variants or children; preserve the current simple union when no API problem exists. |
| “Review an auth subscription effect.”      | React best practices + TypeScript review                | Check primitive dependencies, cleanup, session privacy, and SC-9/SC-10 evidence.                      |
| “Improve profile caching.”                 | React best practices + existing TanStack Query boundary | Check query identity and auth transitions; do not add SWR.                                            |
| “Optimize a future Next.js server action.” | Not applicable to this milestone                        | Reassess architecture and scope before applying a server rule.                                        |

## Delivered-flow review result

The authentication/profile flow already had lazy `QueryClient` initialization,
explicit conditional rendering, cleaned-up auth subscription behavior, and a
TanStack Query key containing the authenticated user ID. No speculative
provider, memoization, SWR, SSR, or dynamic-import change was justified.

One concrete React correctness issue was corrected: repeated child names could
produce duplicate list keys. The profile list now uses its stable display order
as the key (the list entries have no local state), and the regression suite
proves that repeated names remain separate entries. This does not change the
approved product behavior.

The independent review record and final validation evidence are maintained in
`doc/MILESTONE_1_VALIDATION.md`.
