# Project routing

## Apply

Use these upstream rules for a concrete design or review question:

| Situation | Rule | Project use |
| --- | --- | --- |
| A component accumulates mode booleans or render callbacks | `architecture-avoid-boolean-props`, `patterns-explicit-variants`, `patterns-children-over-render-props` | Prefer a small explicit component or `children`; preserve the simple login flow when no API problem exists. |
| Several siblings need the same form state and actions | `state-lift-state`, `state-context-interface`, `state-decouple-implementation` | Introduce a provider only when prop drilling or duplicated state is observable. |
| A component is genuinely a flexible reusable surface | `architecture-compound-components` | Use compound components and context only when consumers need to compose multiple supported pieces. |
| React 19 refs or context are being changed | `react19-no-forwardref` | `ref` may be a regular prop; `useContext` remains a supported React API in this project, so do not perform a mechanical `use()` migration. |

## Do not apply blindly

This is a React 19 + Vite + TanStack Query client. There are no Next.js server
components, Server Actions, or SWR data hooks in this milestone. Do not add
those abstractions merely because an upstream example uses them. Supabase and
TanStack Query remain the application boundaries already approved by the
Product Brief.

## Review question

For every proposed composition change, record the concrete problem it removes,
the affected `SC-*` behavior, and the regression evidence. If there is no
problem beyond stylistic preference, record the rule as reviewed and leave the
production code alone.

