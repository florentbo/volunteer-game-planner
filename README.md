# Volunteer Game Planner v2

Volunteer Game Planner helps approved parents coordinate support for a youth
football team. This repository starts with a secure sign-in foundation; schedule
and volunteering capabilities arrive in later milestones.

## First iteration

An approved parent can:

- request a six-digit code for their registered phone number;
- sign in locally with a fixed test code, without sending an SMS;
- see their saved name and children;
- refresh the browser and remain signed in; and
- sign out of the current browser session.

Public signup, profile editing, schedules, game claims, production SMS, and
deployment are not part of this iteration. See
[the milestone specification](./doc/MILESTONE_1.md) and
[the implementation guide](./doc/IMPLEMENTATION.md).

## Local prerequisites

- Node.js 22
- npm 10+
- Docker

## Local setup

The commands below will become executable as milestone 0 is completed:

```bash
npm install
npm run db:start
npm run db:reset
npm run env:local
cp data/approved-parents.example.json data/approved-parents.local.json
npm run provision:parents -- data/approved-parents.local.json
npm run dev
```

The local test parent is registered as `+32470000001`. Request a code in the
normal login screen and enter `123456`. Supabase accepts that fixed code locally
without contacting an SMS provider.

Fixed OTPs are local-only. Never configure `auth.sms.test_otp` in production,
and never expose the Supabase service-role key to browser code.

Supabase CLI requires local phone signup to be enabled before it will enable the
phone provider. The separate global `auth.enable_signup=false` setting still
blocks public account creation; the browser also sends `shouldCreateUser: false`
as a second safeguard. Production SMS/provider and deployment remain deferred.

## Validation

```bash
npm run check
npm run build
npm run test:db
npm run test:auth
npm run test:e2e
```

Checks report one result line with their exit code, duration, and full log path
under ignored `.logs/`. On failure, the last 40 lines (at most 16 KiB) are also
displayed; the original nonzero exit code is preserved for CI. Read the saved log
for more context. Logs are private local diagnostics and may contain sensitive
data; do not publish them. Use `npm run --silent <script>` to hide npm banners.

`check` stops on the first failure and covers types, lint, formatting, runner
regressions, and application tests. Build, database, and browser checks are
separate gates. Focused tests still work, for example
`npm run --silent test -- src/App.test.tsx`. `dev` and `test:watch` remain
interactive. The runner itself is tested with `npm run test:runner`.
