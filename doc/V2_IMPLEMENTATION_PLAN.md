# Deliver v2 through usable increments

## Summary

Build a new repository with an initially empty application database. Organize implementation around demonstrable user outcomes, with one technical setup milestone followed by four functional milestones.

Use one persistent Codex goal for the project and record milestone progress in this document.

This document is the agreed plan; implementation has not started.

## Product delivery loop

Use the project-local `product-owner` and `functional-analysis` skills together
with the global `ai-tdd` skill. Work one useful outcome at a time:

1. `product-owner` recommends the next smallest useful outcome and records the
   approved scope, non-goals, and success evidence in a Product Brief.
2. `functional-analysis` resolves the business rules and produces traceable
   `BR-*` rules and concrete `SC-*` acceptance scenarios.
3. `ai-tdd` implements one accepted `SC-*` scenario at a time through Red,
   Super Green, and Refining Refactor.
4. An independent TypeScript review checks the accepted brief, scenarios,
   implementation diff, runtime boundaries, security, and tests. The reviewer
   reports findings and does not modify the code it reviews.
5. The implementer addresses valid findings, runs the milestone validation, and
   demonstrates the outcome. `product-owner` records acceptance and recommends
   the next outcome.

Material product scope and priority decisions remain with the product authority.
Open low-risk questions may be retained with an owner; blocking questions must
be settled before implementation.

The TypeScript review skill is deliberately deferred. Define it after the FA and
PO skills have been exercised on milestone 1 analysis and before milestone 1 is
accepted. Its project-local name will be `typescript-review`. Reuse the generic
reviewer's independence, fixed-diff scope, severity vocabulary, security, and
testability principles, but do not inherit blanket class-oriented Clean Code
rules or Angular-specific conventions.

### Deferred TypeScript review contract

The reviewer accepts a fixed Git comparison point, the approved Product Brief,
the applicable `BR-*` rules and `SC-*` scenarios, repository instructions, and
the available validation evidence. If the comparison point is absent or does
not resolve, stop and ask for it. Review the complete changed files when diff
context alone is insufficient.

Report findings under two independent axes so correct-looking code cannot hide
the wrong product behavior, and correct product behavior cannot hide unsafe
code:

- **Spec:** missing or partial scenarios, incorrect behavior, and unapproved
  scope.
- **Engineering:** TypeScript correctness, runtime boundaries, React and state
  behavior, security, tests, and maintainability relevant to the change.

Do not merge the two axes into one score. Every finding states severity, exact
location, violated scenario or engineering rule, user or operational impact,
and a correction direction. The reviewer reports only evidence-backed findings,
does not manufacture comments to fill categories, and never edits reviewed
code.

Keep `SKILL.md` as a concise review-and-routing workflow. Put substantial rules
in references that are loaded only when the diff needs them:

- TypeScript correctness, narrowing, unsafe assertions, async behavior, error
  handling, and validation where untrusted data enters the application.
- React 19 and Vite behavior, using only applicable client-side performance and
  composition guidance rather than Next.js or React Server Component rules.
- TanStack Query keys, invalidation, dependent queries, optimistic rollback,
  cache state, and mutation concurrency.
- Supabase authentication and RLS, browser/server credential boundaries,
  Sportlink payloads, Europe/Brussels dates, and claim concurrency.

Source non-obvious guidance from current official documentation, library source,
and demonstrated failure modes. Record the inspected source version or date so
stale framework guidance can be identified later. Do not duplicate rules that
TypeScript, ESLint, or another configured tool enforces reliably.

Research inputs for the first version are Matt Pocock's separate
[Spec and Standards review axes](https://github.com/mattpocock/skills/blob/main/docs/engineering/code-review.md),
TanStack Intent's [source-grounded skill generation](https://github.com/TanStack/intent),
Vercel's conditional [React performance guidance](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices),
and the official [TanStack Query ESLint rules](https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query).
Treat these as inputs rather than installing their complete skill collections
or making their conventions project authority.

## Behavior-first TDD strategy

Use a Testing Trophy: static analysis forms the base, integration tests carry
most behavioral confidence, focused unit tests cover isolated logic, and a few
browser tests protect critical journeys. Organize tests by capability and
accepted scenario, never by a rule that every class, component, interface, or
source file needs a matching test file.

Choose the cheapest stable boundary that can expose the real failure:

| Behavior | Primary test boundary |
|---|---|
| Pure parsing, date calculation, transformation, or domain invariant | Focused Vitest test |
| React behavior spanning components and state | React Testing Library integration test |
| Supabase schema, constraints, RLS, and database functions | pgTAP through `supabase test db` |
| Authenticated application behavior against Supabase | `supabase-js` integration test against the local stack |
| Sportlink request and response compatibility | Adapter contract test with sanitized real-shaped fixtures |
| Critical parent journey through the browser | Playwright end-to-end test |
| Production provider configuration and real SMS | Deployment smoke test |

Mock only unavailable external boundaries. Use the real local Supabase stack for
database, authentication, authorization, and concurrency behavior. Assert on
state and user-visible outcomes instead of internal calls. Do not repeat the same
claim at every layer unless each test detects a distinct failure mode.

## Milestones and deliverables

### 0 — Technical foundation

Initialize Git immediately after creating the new repository directory at `/home/florent/personal-dev/volunteer-game-planner-v2`. Copy this branch's `.agents/skills` directory into the new repository. Set up React, Vite, TypeScript, TanStack Query, Supabase, Tailwind, Vitest, React Testing Library, Playwright, Supabase database tests, and build checks. Configure the official TanStack Query ESLint plugin with the project's TypeScript and React linting; keep mechanically enforceable Query rules out of the future review skill. Resolve current stable compatible dependencies and commit the lockfile.

Write the README and implementation document first, including flows, acceptance criteria, environment setup, and instructions for testing phone login without SMS.

**Delivered:** a runnable, tested project foundation and clear documentation. No functional feature required.

### 1 — Parents can sign in

Implement the phone-login screen, Supabase authentication, approved-user provisioning, saved parent/child profiles, session restoration, and logout.

Use fixed OTPs with local test accounts during development. Keep application data protected from the beginning. Disable public signup and provision approved users through a server-side script using an ignored local file.

**Delivered:** you can log in locally without sending SMS, see your saved profile, refresh while remaining signed in, and log out.

### 2 — Parents can view the real schedule

Implement the Sportlink adapter, initial `games` schema, manual synchronization command, and authenticated schedule screen together.

Import U11G-1 fixtures and results. Show home, away, future, and past games, with dates displayed in Europe/Brussels time. Repeated imports update games by Sportlink match identifier without duplicates. Do not delete games solely because one upstream response omits them.

**Delivered:** you can run one command and see the real team schedule in the app.

### 3 — Two parents can volunteer

Add `game_claims` and atomic `claim_game(game_id)` and `release_game(game_id)` operations, together with the complete UI.

Future home games accept two distinct authenticated parents. Show both names and occupancy (`0/2`, `1/2`, `2/2`). Parents can release only their own future claims. Away and past games remain visible and read-only.

Enforce these rules in the database, including concurrent requests and one claim per parent per game. Synchronization preserves claims when dates change.

**Delivered:** two parents can volunteer for a home game; a third cannot take a place, and either claimant can free their own place.

### 4 — Parents can use it online with automatic updates

Configure production phone authentication through Twilio Verify, provision the approved parents, deploy to Netlify, and schedule daily Sportlink synchronization at `04:15 UTC`.

The manual command and scheduled function invoke the same synchronization use case. Keep Sportlink and Supabase service credentials server-side.

Verify the deployed login and claim flow, real SMS delivery, and scheduled execution before switching the existing `boys-fruits` site to v2.

**Delivered:** parents can use the live application, and schedule changes arrive automatically each day.

## Testing phone login without SMS

During the Markdown setup, also put this section prominently in the new repository's README so developers can find it quickly.

Run a local Supabase stack and point the application at its local URL and client key. Provision a local test user with phone `+32470000001` and a parent/child profile; the fixed OTP mapping does not create that user when signup is disabled.

Add this mapping to local `supabase/config.toml`:

```toml
[auth.sms.test_otp]
32470000001 = "123456"
```

Restart local Supabase after configuration changes:

```bash
npx supabase stop
npx supabase start
```

In the login screen, enter `+32470000001`, request a code, then enter `123456`. Supabase uses the fixed code without sending SMS. The application still uses its normal OTP authentication flow.

Use mocked authentication for component tests and the local fixed OTP for integration tests. Never enable fixed OTPs in production; verify real SMS delivery during the deployment milestone.

References: [Supabase CLI test OTP configuration](https://supabase.com/docs/guides/local-development/cli/config#authsmstest_otp), [phone login](https://supabase.com/docs/guides/auth/phone-login).

## Acceptance and testing

Each milestone ends with a short demonstration, relevant passing tests, documentation updates, and a commit.

For each `SC-*` scenario, first select its primary test boundary, observe a
meaningful failure, implement the behavior, and run the affected integration
slice. At milestone completion, run TypeScript and lint checks, the complete
Vitest suite, Supabase database tests, and the milestone's critical Playwright
flows. Do not use test-layer percentages or coverage quotas as a substitute for
confidence in the agreed behavior.

- Login: approved accounts, wrong OTP, restored session, logout, and anonymous denial.
- Schedule: real fixtures, results, timezone display, repeated imports, and upstream failures.
- Claims: simultaneous requests cannot exceed two places; duplicate parents and unauthorized releases are rejected; date changes preserve claims.
- Deployment: production login, claim/release, manual sync, and confirmed scheduled execution.

## Assumptions

- No legacy data transfer is required; the application schema starts empty. Schema creation scripts are still required for reproducible setup.
- Fifteen approved parents, French UI, and U11G-1 remain the initial scope.
- Fixed OTP accounts are provisioned locally and never enabled in production.
- Milestones 1–3 are demonstrated locally; milestone 4 delivers the public deployment.
- The new application uses a separate repository; this branch stores the agreed plan in the current repository.
