# Deliver v2 through usable increments

## Summary

Build a new repository with an initially empty application database. Organize implementation around demonstrable user outcomes, with one technical setup milestone followed by four functional milestones.

Use one persistent Codex goal for the project and record milestone progress in this document.

This document is the agreed plan; implementation has not started.

## Milestones and deliverables

### 0 — Technical foundation

Initialize Git immediately after creating the new repository directory at `/home/florent/personal-dev/volunteer-game-planner-v2`. Set up React, Vite, TypeScript, TanStack Query, Supabase, Tailwind, tests, and build checks. Resolve current stable compatible dependencies and commit the lockfile.

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
