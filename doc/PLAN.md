# Ruthless Refactor Plan

## Blunt Critique

- Architecture: Superficial `IDatabase` abstraction without contract tests; DI via props causes prop drilling; no Context/provider; bragging about "component-based" is baseline React, not architecture.
- Documentation: README is untouched Vite boilerplate with zero app-specific setup/usage.
- Security: Hardcoded manager PIN ('1234') advertised in docs; unacceptable even for a toy app.
- Code Structure: Tests target interfaces/types (e.g., `IDatabase.test.ts`, `Game.test.ts`) instead of behavior; inconsistent coverage (missing `ClaimGameDialog` tests).

This plan fixes the sloppy bits called out in CLAUDE.md and the useless boilerplate README. It focuses on removing prop-drilled dependencies, eliminating hardcoded secrets, tightening types/contracts, and making tests and docs actually useful.

## Objectives (Non‑Negotiable)

- Remove database prop-drilling; introduce a proper app-level data layer.
- Kill the hardcoded PIN; move gating behind a server-side boundary.
- Replace the template README with real, project-specific docs.
- Align tests with behavior (no “tests” for interfaces/types); cover missing components.
- Make data types explicit and validated at boundaries.

## Architectural Changes

1. Data access and state
   - Add `DatabaseProvider` + `useDatabase()` hook via React Context.
   - Replace component-level DB prop usage with the hook (GameList, GameCard, AddGameForm, ClaimGameDialog).
   - Adopt TanStack Query (or SWR) for fetching/caching/invalidation; integrate Supabase real-time to invalidate queries on changes.

2. Interface/contract sanity
   - Either commit to `IDatabase` with real contract tests or remove it.
     - If keeping: rename to `Database` (drop the “I” prefix), lock a narrow surface: `listGames`, `createGame`, `claimGame`, `releaseGame`, `subscribe`.
     - Add contract tests against both Mock and Supabase implementations using shared fixtures.

3. Types and validation
   - Centralize Game type in one place with runtime validation via Zod.
   - Normalize dates to ISO strings at the edge; convert to Date in UI.
   - Define strong input schemas for user-provided fields (opponent, volunteer).

4. Security and auth
   - Delete the hardcoded manager PIN from code/docs immediately.
   - Gate manager-only actions via a serverless function (Netlify function) that checks a secret env var; return a short-lived token/flag to the client.
   - If using Supabase: add RLS policies and use service role only on the serverless side.

5. Error handling and UX
   - Implement optimistic updates with rollback for claim/release.
   - Surface actionable errors (validation, network) with MUI alerts/snackbars.
   - Ensure real-time subscriptions are cleaned up to prevent leaks/duplicates.

## File/Module Plan

- Add: `src/context/DatabaseProvider.tsx` (creates client, provides context)
- Add: `src/hooks/useDatabase.ts` (typed hook to access db)
- Update: `src/App.tsx` to wrap the tree with `DatabaseProvider`; remove `db` prop
- Update: `src/components/*` to use `useDatabase()` and Query hooks
- Update: `src/database/SupabaseDatabase.ts` to match the trimmed contract
- Update/Remove: `src/database/IDatabase.ts` (rename to `Database.ts` or delete if not justified)
- Add: `src/types/game.ts` + `src/types/game.schema.ts` (Zod)
- Add: `src/lib/env.ts` to read and validate `import.meta.env` vars
- Add: `netlify/functions/manager-auth.ts` (verifies secret, issues token)
- Tests: remove type/interface “tests”; add behavior tests for `ClaimGameDialog`, integration tests for DB via Mock, and contract tests if keeping the interface
- Docs: replace README with real content; add SECURITY notes and ENV setup

## Phased Execution

1. Baseline cleanup (fast)
   - Remove/rename meaningless tests (`*.test.ts` for interfaces/types).
   - Add Zod schemas for Game and input forms; wire validation in forms.

2. Data layer and fetching (core)
   - Introduce `DatabaseProvider` + `useDatabase()`; remove DB props.
   - Migrate data access to TanStack Query; add query keys and invalidation.
   - Add Supabase channel subscription that invalidates relevant queries.

3. Manager gating and secrets (security)
   - Implement `manager-auth` Netlify function; read secret from env.
   - Replace PIN check in UI with a call to the function; persist flag in memory.
   - Ensure no secrets or keys live in the client bundle.

4. Testing pass (credibility)
   - Unit: components (GameCard, AddGameForm, ClaimGameDialog) with success/error paths.
   - Integration: DB mock + contract tests (if keeping interface).
   - E2E (optional): basic flow to claim/release.

5. Documentation and DX (finish)
   - Rewrite README: purpose, setup, env vars, scripts, development, deployment.
   - Document the data model and RLS/policies (if using Supabase).
   - Ensure `npm run build`, `npm run test`, `npm run lint` pass in CI.

## Acceptance Criteria

- No component receives a database instance via props; all data access through context/hooks.
- No hardcoded PIN or secrets in repo or client bundle.
- Real-time updates reflect without manual refresh; no duplicate events after nav.
- Tests cover critical flows; no tests target types/interfaces directly.
- README explains this project (not Vite boilerplate) and enables a new dev to run it.

## Risks and Mitigations

- Real-time duplication/leaks: centralize subscriptions in provider; clean up on unmount.
- Date/time bugs: convert to ISO at persistence boundary, parse at UI, test TZ edge cases.
- Contract drift (if keeping interface): enforce with shared contract tests and fixtures.

## Environment Variables (initial set)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `MANAGER_SECRET` (server-only; consumed by Netlify function)

## Nice-to-Haves (after core is green)

- Add GitHub Actions CI for build/lint/test.
- Storybook or Chromatic for component states (claimed/unclaimed, errors).
- Analytics on claim/release events (privacy-safe; no PII).
