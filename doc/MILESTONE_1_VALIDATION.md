# Milestone 1 validation record

Validated against the approved Product Brief and functional analysis in
[MILESTONE_1.md](./MILESTONE_1.md) on 2026-09-08.

## Scenario evidence

| Scenario                                     | Evidence                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| SC-1 approved local-code request             | React integration test and real Playwright journey                                                                             |
| SC-2 unknown phone is refused without signup | React integration test, adapter contract test, and real local Auth test proving direct public signup is denied                 |
| SC-3 invalid E.164 syntax                    | React integration test verifies no auth request                                                                                |
| SC-4 correct OTP establishes a session       | React integration test and real Playwright journey using local fixed OTP `123456`                                              |
| SC-5 wrong or expired OTP                    | React integration test keeps code entry and shows retryable French error                                                       |
| SC-6 own profile display                     | React integration test and real Playwright journey                                                                             |
| SC-7 isolated profile access                 | pgTAP test proves anonymous denial and isolated rows for each of two parents; browser roles cannot insert profiles or children |
| SC-8 missing profile safety                  | React integration test proves no profile data is shown on query failure                                                        |
| SC-9 session restoration                     | React integration test verifies the initialization loading state; real Playwright journey reloads and restores the profile     |
| SC-10 local logout and cache clearing        | React integration tests cover logout and external session loss; real Playwright journey returns to phone login                 |
| SC-11 recoverable backend failure            | React integration test proves a French error with retry leading to the profile                                                 |

## Reproducible local setup

From a clean checkout with Docker running:

```bash
npm install
npm run --silent db:start
npm run --silent db:reset
npm run --silent env:local
cp data/approved-parents.example.json data/approved-parents.local.json
npm run --silent provision:parents -- data/approved-parents.local.json
```

The provisioning command was run twice against the same local state after its
phone-normalization regression fix; the second execution succeeded.

## Final validation

All commands succeeded on the final worktree:

```bash
npm run --silent check
npm run --silent build
npm run --silent test:db
npm run --silent test:auth
npm run --silent test:e2e
```

The command runner preserves exit codes, writes complete private logs under
ignored `.logs/`, and shows only a bounded failure tail. Playwright Chromium is
a local developer/CI prerequisite installed with `npx playwright install chromium`.

The frontend-skill integration also passed the project-local packaging and
routing gate through `npm run --silent test:skills`; that gate is included in
`npm run --silent check`. Both Vercel skill directories passed the
skill-creator structural validator.

## Deployment boundary

The local Supabase CLI requires an enabled phone provider and local SMS signup
to exercise phone OTP. The configured fixed test OTP bypasses SMS delivery.
Global `auth.enable_signup=false` blocks direct public account creation, and the
browser additionally sends `shouldCreateUser: false`. Production SMS/provider
and deployment configuration are outside this milestone; remove the fixed OTP
and use real secret management before deployment.

## Independent review and Product Owner assessment

An independent read-only review was completed before acceptance. Its two
blocking findings—an incorrect setup order and insufficient proof against direct
signup—were corrected and revalidated. It also led to recoverable failed-logout
handling and quieter command output.

Product Owner assessment: **Accepted with follow-up.** The approved parent
outcome is demonstrably delivered. Keep atomic replacement of a parent's child
list during provisioning in the backlog before operational data is maintained
through this tool.

## Product Owner reassessment after frontend skill integration

The outcome remains **Accepted with follow-up**. The integration changes review
and implementation guidance but adds no new product feature, deployment work,
or authentication scope. The only production correction prevents duplicate
React list keys when two saved children have the same display name; the
duplicate entries remain visible and all approved `SC-1` through `SC-11`
behaviors remain unchanged. The existing atomic provisioning replacement item
is still the next follow-up.

The independent review for this integration reports Spec and Engineering axes
separately. The Engineering axis records the React/Vite/TanStack Query filters,
the Next.js/SWR exclusions, and the React 19 `useContext` exception in
`.agents/skills/*/references/project-routing.md`.

The independent reviewer raised the existing non-atomic child-list replacement
as a `[SUGGESTION]`; it remains the documented follow-up because this goal did
not expand provisioning scope. The reviewer also raised a one-assertion-per-test
style rule, but that rule is specific to the SFPD Java/Maven instructions and is
not a requirement for this Vite/TypeScript project. The behavior-level tests
were therefore retained.
