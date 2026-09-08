# First iteration: foundation and parent sign-in

## Product Brief: approved parents can sign in

### Problem and user

The current application accepts self-entered parent names and has no parent
identity. An approved parent needs a secure identity before schedules and game
claims can be associated with real people.

### Desired outcome and success evidence

An approved parent signs in locally through the same phone OTP flow intended for
production, sees their saved parent/child profile, refreshes without losing the
session, and signs out. The demonstration uses a fixed local OTP and sends no
SMS.

### Smallest useful increment

Create the reproducible React/Supabase/test foundation and implement approved
phone OTP request, verification, own-profile display, session restoration, and
local sign-out in French.

### Non-goals

Public signup, account recovery, resend countdowns, profile editing, roles,
manager features, schedules, volunteering, production SMS, notifications, and
deployment are deferred.

### Constraints and dependencies

- Only provisioned phone numbers may authenticate.
- Local development uses `+32470000001` with fixed OTP `123456`.
- Fixed OTPs and service-role credentials must never enter production or browser
  code.
- Application data starts empty and is reproduced from migrations and explicit
  provisioning.
- The initial interface is French and supports modern mobile and desktop
  browsers.

### Decision

Recommendation: deliver milestones 0 and 1 as one iteration because technical
scaffolding alone provides no user outcome.

Authority: project owner

Status: approved through the active implementation goal

### Open product questions

None block this iteration.

## Functional analysis: approved parent sign-in

### Context and evidence

- E-1 — Existing application: parents currently enter unverified names when
  volunteering; there is no parent authentication.
- E-2 — Approved v2 plan: fifteen approved parents, French UI, disabled public
  signup, Supabase phone OTP, saved profiles, restoration, and logout are in
  scope.
- E-3 — Supabase Auth: browser sessions persist by default and auth state changes
  expose initial, signed-in, refreshed, and signed-out sessions.
- E-4 — Supabase local configuration: `auth.sms.enable_signup` can disable SMS
  signup and `auth.sms.test_otp` provides predefined local codes.

### Rules and scenarios

#### BR-1 — Only approved parents can start authentication

Invariant: requesting an OTP must never create an account.

- SC-1 — Approved parent requests a local code
  Given `+32470000001` has been provisioned and local Supabase is running
  When the parent submits that phone number
  Then the interface asks for a six-digit code and no SMS provider is contacted

- SC-2 — Unknown phone number is refused
  Given a phone number has not been provisioned
  When it is submitted
  Then the interface remains on phone entry and shows a generic French sign-in
  error without creating an auth user

- SC-3 — Invalid phone syntax is rejected locally
  Given the parent enters a value that is not an E.164 phone number
  When the form is submitted
  Then no authentication request is made and the field explains the required
  international format

#### BR-2 — A valid OTP establishes the parent session

Invariant: profile data is unavailable until Supabase returns an authenticated
session.

- SC-4 — Correct OTP signs the parent in
  Given the approved local parent has requested a code
  When they submit `123456`
  Then an authenticated session is established and their profile is shown

- SC-5 — Wrong or expired OTP is refused
  Given an approved parent is on code entry
  When they submit an invalid or expired six-digit code
  Then they remain on code entry and see a generic French verification error

#### BR-3 — A parent sees only their saved profile

Invariant: an authenticated user can select only the profile and children whose
parent user ID equals `auth.uid()`; anonymous users receive no application rows.

- SC-6 — Own profile is displayed
  Given the authenticated test parent has one saved child
  When their profile query succeeds
  Then the page shows the saved parent name and child name

- SC-7 — Profile access is isolated
  Given two provisioned parents and an anonymous client
  When each client queries profiles and children
  Then each authenticated parent receives only their rows and the anonymous
  client receives none

- SC-8 — Missing profile fails safely
  Given authentication succeeds but no matching profile exists
  When the application loads the profile
  Then it shows a recoverable French configuration error and no other profile

#### BR-4 — Session lifecycle is explicit

Invariant: the interface never flashes private data while session state is
unknown and removes private cached data when signing out.

- SC-9 — Refresh restores the session
  Given an approved parent is signed in
  When the browser reloads
  Then a loading state is shown until the initial session is known and the same
  saved profile is displayed without another OTP

- SC-10 — Local logout returns to login
  Given an approved parent is signed in
  When they choose logout
  Then only the current browser session is signed out, private profile cache is
  cleared, and the phone login form is shown

- SC-11 — Temporary backend failure is recoverable
  Given an auth or profile request fails temporarily
  When the failure is returned
  Then the interface shows a French retryable error and does not expose stale or
  foreign profile data

### Decisions

- D-1 — Phone input uses E.164 form for this iteration; authority: project
  plan; rationale: it avoids ambiguous Belgian normalization before product
  evidence justifies additional formats; affects BR-1.
- D-2 — Logout uses Supabase's local scope; authority: implementation decision;
  rationale: logging out this browser must not unexpectedly revoke other parent
  sessions; affects BR-4.
- D-3 — Parent profiles and children are read-only to browser roles; authority:
  approved provisioning constraint; rationale: this iteration has no profile
  editing and the service-role provisioning path is the only writer; affects
  BR-3.

### Open questions

None block implementation. Supporting Belgian local-number formatting and
parent-managed profile edits remain owned by future product discovery.

### Coverage and handoff

SC-1 through SC-11 cover nominal, validation, authorization, missing-data,
session-transition, and external-failure behavior. Implementation proceeds one
scenario at a time through the test boundary listed in `IMPLEMENTATION.md`.
