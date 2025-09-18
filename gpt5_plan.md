# GPT5 Architecture & Hardening Plan

## 1. Purpose

Establish a pragmatic, evolutionary path from a prototype game schedule app toward a maintainable, testable, auditable system without premature over-engineering. Consolidates prior critical assessment plus a refactor roadmap.

## 2. Current State Snapshot (Blunt)

- README still Vite boilerplate; true project identity hidden.
- Hardcoded manager PIN (`1234`) = security theater.
- Implicit domain rules (game uniqueness, time validation) not enforced.
- IDatabase abstraction exists but lacks formal contract (error semantics, concurrency guarantees).
- Real-time behavior + subscription lifecycle undocumented.
- Tests exist but coverage/edge cases unspecified (likely low concurrency + failure-path testing).
- No environment specification (`.env.example` missing), no migration/runbook, no audit logging.
- Accessibility & input validation concerns unaddressed.
- Risk of state desync (race to claim) and date/time inconsistencies.

## 3. Key Risk Areas

- Security: Weak gating, no auth provider, no rate limits.
- Data Integrity: Concurrent claims undefined; no atomic constraint.
- Observability: No logging, metrics, or error classification.
- Maintainability: Domain logic scattered in UI components.
- Onboarding: Poor docs impede contributors and handoffs.
- Compliance/Future Scale: No audit trail or migration discipline.

## 4. Architectural Direction (Principles)

- Start lean: “Ports & Adapters Lite”—define seams only where change is plausible (persistence, auth, time, ID generation).
- Codify domain invariants early (not optional).
- Make concurrency + failure explicit: treat “claim” as a first-class use case with atomic semantics.
- Test at use-case boundaries, not just components.
- Evolve toward fuller Hex / DDD only if new adapters emerge (e.g., alternate datastore, queue, reporting service).

## 5. Is DDD / Hex Over-Engineered Here?

- Full-blown DDD (aggregates, repositories, domain events, ubiquitous language workshops) is overkill right now.
- A slim interpretation (clear domain model + application services + ports) yields high leverage with low ceremony.
- Justification Threshold: 2+ alternative adapters OR complex invariant dynamics. Current: One persistence (Supabase), soon one auth (Clerk). Still acceptable to prepare minimal ports.
- Recommendation: Implement:
  - Domain Layer: `Game` + rules (factored into pure functions / value objects).
  - Application Layer: Use case services (ClaimGame, ReleaseGame, AddGame, ListGames).
  - Ports: `GameRepository`, `AuthService`, `Clock`, `IdGenerator`.
  - Adapters: SupabaseGameRepository, ClerkAuthService (future), InMemoryGameRepository (tests).
- Defer: Domain events bus, CQRS split, elaborate module boundaries—until real scaling or integration pressure.

## 6. Target Lean Layering

- Domain: Entities, value objects, invariants, pure logic.
- Application: Orchestrates use cases; enforces transactions; maps errors.
- Ports (Interfaces): Persistence, Auth, Time, IDs.
- Adapters (Infra): Supabase, Clerk (future), test doubles.
- Presentation: React UI -> calls application services (not raw repositories).
- Cross-Cutting: Error taxonomy, logging facade, config loader, audit logger.

## 7. Refactor Roadmap (Phased)

Phase 0 (Stabilize Docs & Config)

1. Replace README with real project overview, setup, env vars.
2. Add `.env.example` (SUPABASE_URL, SUPABASE_ANON_KEY, MANAGER_PIN or CLERK vars placeholder).
3. Document run commands, seeding, clearing volunteer claims.

Phase 1 (Security & Access) 4. Remove hardcoded PIN constant; load from env. 5. Add basic PIN attempt throttling (client + minimal server check if feasible). 6. Prep switch: abstract `AuthService` port.

Phase 2 (Domain Extraction) 7. Create `src/domain/`:

- `Game.ts` (entity + constructor guard).
- `GameRules.ts` (invariants: no past date, unique id creation, claim preconditions).

8. Move claim/release logic out of React components into `ClaimGameService.ts`.
9. Introduce `ApplicationError` taxonomy (e.g., ConflictError, ValidationError, AuthError).

Phase 3 (Ports & Adapters) 10. Define `GameRepository` interface (methods + concurrency semantics doc). 11. Implement `SupabaseGameRepository` (map DB rows ↔ domain). 12. Add `InMemoryGameRepository` updated to respect same invariants for tests. 13. Add `Clock` + `IdGenerator` ports to ease deterministic tests.

Phase 4 (Concurrency & Integrity) 14. Implement atomic claim logic (one of: DB row constraint with volunteer IS NULL, RPC function, or optimistic transaction fallback). 15. Surface race conflict to UI with friendly retry. 16. Add test cases simulating dual-claim attempts.

Phase 5 (Testing Overhaul) 17. Introduce coverage threshold (e.g. 80% lines, 90% critical domain). 18. Add use-case tests (claim, release, add with invalid date). 19. Add property test (optional) for idempotent release. 20. Integrate concurrency test (simulate rapid claims).

Phase 6 (Observability & Audit) 21. Add lightweight logging wrapper (console now, structured later)
