---
name: functional-analysis
description: Analyze a feature, business rule, or defect through evidence, decision-focused questions, and concrete acceptance scenarios. Use before implementation when behavior, scope, edge cases, or business rules need to be settled. Do not use for product prioritization, technical design, implementation, or code review.
---

# Functional analysis

Turn an approved product outcome or reported problem into behavior that a user,
tester, and developer can verify. Be direct about contradictions and weak
assumptions. The user's instructions and decisions from the named authority take
precedence over this workflow.

## Establish the analysis boundary

Choose the mode from the request without ceremony:

- **Feature or rule:** discover and specify the required behavior.
- **Defect:** establish observed behavior, expected behavior, and the violated
  rule before shaping regression scenarios.
- **Ticket shaping:** package already-settled analysis without reopening it;
  flag missing facts instead of inventing them.

Read the relevant project docs, code, schemas, and existing tests first. Record
what they prove; distinguish current behavior from intended behavior. If a
Product Brief exists, treat its approved outcome, scope, and non-goals as the
analysis boundary. Return unresolved value, priority, or MVP decisions to the
Product Owner.

Identify the decision authority. The person in the conversation may provide
evidence without owning the business decision. Recommend a concrete answer to
each decision, explain its impact, and record who accepted it.

## Explore the decision tree

Build a decision tree internally. A decision becomes askable only when its
prerequisites are settled. Examine the current frontier through these lenses:

| Lens | Looks for |
|---|---|
| Business | Rules, invariants, vocabulary, authoritative sources |
| User | Goals, expectations, confusion, accessibility |
| QA | Boundaries, combinations, regressions, observable proof |
| Development | State transitions, concurrency, failures, external boundaries |
| Product | Scope or outcome ambiguity that must return to the Product Owner |

Ask one to three independent, high-impact questions per round. Each question
includes a recommended answer and the consequence of choosing differently.
Investigate discoverable facts rather than asking the user to retrieve them.
When evidence is inaccessible, record that limitation and ask only for the
decision that cannot safely be inferred.

Do not chase theoretical completeness. Finish when all decisions that could
change the selected increment, its acceptance, or a material risk are settled.
Keep non-blocking uncertainty as an open question with an owner and impact.

## Produce the functional analysis

Use stable identifiers so decisions and tests remain traceable:

- `E-*`: evidence, including source and observation date when relevant;
- `BR-*`: business rule or invariant;
- `D-*`: decision, authority, rationale, and affected rules;
- `SC-*`: concrete Given/When/Then acceptance scenario;
- `Q-*`: unresolved question, owner, impact, and blocking status.

Group scenarios by business rule, not source file, class, or screen. For each
rule, cover the relevant nominal, boundary, error, authorization,
state-transition, concurrency, and external-failure behavior. Use synthetic but
realistic values. Do not add a category that has no meaningful scenario.

Use this compact output shape:

```markdown
# Functional analysis: <outcome>

## Context and evidence
- E-1 — <source>: <fact, current behavior, or constraint>

## Rules and scenarios
### BR-1 — <business rule>
Invariant: <what must remain true>

- SC-1 — <behavior name>
  Given <concrete context>
  When <action or event>
  Then <observable outcome>

## Decisions
- D-1 — <decision>; authority: <person or role>; rationale: <why>

## Open questions
- Q-1 — <question>; owner: <person or role>; impact: <effect>; blocking: yes/no

## Coverage and handoff
- <rule and scenario coverage, contradictions, and assumptions>
```

## Handoff to implementation

An increment is ready for `ai-tdd` when its Product Brief boundary is approved,
its material rules have scenarios, no blocking question remains, and each
scenario has an observable outcome. Hand off one `SC-*` scenario at a time.

The implementer selects the cheapest stable boundary that can prove the
behavior: pure domain boundary, application integration, real local database,
adapter contract, UI integration, or browser flow. A scenario may exercise many
production modules; never require a test file per production file or class.
