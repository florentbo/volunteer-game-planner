# Implementation guide

## Delivery workflow

Each useful outcome follows this sequence:

1. Product Owner approves a Product Brief.
2. Functional Analysis settles business rules and `SC-*` scenarios.
3. Implementation advances one scenario at a time with Red → Super Green →
   Refining Refactor. The project-local `ai-tdd` workflow is the implementation
   loop; Vercel's composition and React performance skills are consulted during
   design and the Refining Refactor decision, not used as a reason to add
   speculative abstractions.
4. An independent reviewer compares the diff separately with the specification
   and engineering standards. The engineering axis includes the applicable
   Vercel rules; the specification axis remains independent.
5. Product Owner accepts the demonstrated outcome.

The first iteration's approved brief and analysis are in
[MILESTONE_1.md](./MILESTONE_1.md).

## Architecture for the first iteration

- React 19 and Vite render one responsive French interface.
- Supabase Auth owns phone OTP sessions and persists them in browser storage.
- A small application-facing auth service keeps Supabase session types out of
  components and exposes subscription, OTP request, OTP verification, and local
  sign-out operations.
- TanStack Query loads the signed-in user's profile through a repository
  boundary and clears private cached data when the session ends.
- PostgreSQL stores one parent profile and zero or more children per auth user.
  Browser clients may only select their own rows; provisioning owns all writes.
- A server-side provisioning command reads an ignored JSON file and uses the
  service-role key. It is rerunnable and never ships service credentials to the
  Vite bundle.

## Test boundaries

| Behavior                                        | Primary evidence                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| Login states and profile display                | React Testing Library integration tests with controlled app services |
| Supabase auth adapter mapping                   | Focused Vitest tests                                                 |
| Profile grants and row isolation                | pgTAP database tests                                                 |
| Real local OTP, session restoration, and logout | Playwright against local Supabase                                    |
| Build configuration                             | TypeScript, ESLint, Prettier, and production build                   |

Tests are organized by behavior and stable seams. There is no requirement for a
test file per class, component, or source file.

## Frontend review routing

The project-local upstream skills are pinned in
`.agents/skills/vercel-composition-patterns/` and
`.agents/skills/vercel-react-best-practices/`. Their project filters are the
source of truth for what applies to this React/Vite/TanStack Query client.

- Use composition patterns for a concrete component API or shared-state design
  problem: boolean-mode proliferation, prop drilling, render-prop APIs, or a
  genuinely reusable compound surface.
- Use React best practices for concrete effect, render, request, or bundle
  risks. Keep TanStack Query, do not introduce SWR, and skip Next.js/server and
  hydration rules in this Vite client.
- In a review, record a rule as “reviewed, no change” when the delivered code
  already satisfies it. A pattern is not a defect by itself.

## Environment boundaries

Browser variables use the `VITE_` prefix and contain only the local Supabase URL
and publishable key. Provisioning uses unprefixed server-only variables for the
URL and service-role key. Environment access is centralized and validated before
either client starts.

The repository commits `.env.example` and
`data/approved-parents.example.json`. It ignores `.env.local`, service-role
credentials, and `data/approved-parents.local.json`.

## Milestone completion gate

Milestones 0 and 1 are complete only when a clean checkout can install, start
Supabase, reset the schema, provision the test parent, run the application, and
pass static checks, Vitest, pgTAP, and the critical Playwright journey.
