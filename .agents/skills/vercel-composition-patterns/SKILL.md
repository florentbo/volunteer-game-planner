---
name: vercel-composition-patterns
description:
  React composition patterns that scale. Use when refactoring components with
  boolean prop proliferation, building flexible component libraries, or
  designing reusable APIs. Triggers on tasks involving compound components,
  render props, context providers, or component architecture. Includes React 19
  API changes.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# React Composition Patterns

Use this skill when a component API is becoming conditional, prop-heavy, or
hard to compose. Prefer explicit composition and stable state boundaries over
adding another mode flag. Read `references/project-routing.md` before applying
the upstream rules in this React/Vite application.

The upstream quick reference is retained below. The source snapshot and the
project-specific applicability rules are recorded in `SOURCE.md`.

## When to Apply

- Refactoring components with many boolean props.
- Designing reusable component APIs or compound components.
- Reviewing context-provider and state-boundary design.
- Replacing render-prop APIs where children composition is clearer.

## Rule Categories

- `architecture-*`: avoid boolean-prop proliferation and use compound
  components where the component is genuinely complex.
- `state-*`: lift shared state into a provider and expose a UI-facing
  state/actions/meta interface.
- `patterns-*`: prefer explicit variants and children composition when they
  make the supported modes visible.
- `react19-*`: use current React 19 APIs only when they improve this code;
  check the project exception for context consumption.

## Guardrail

Do not introduce a provider, context, compound component, or memoization layer
just to match a pattern. This milestone has a small, local authentication
flow; a composition refactor must remove a concrete API or state problem and
retain the approved scenarios.

