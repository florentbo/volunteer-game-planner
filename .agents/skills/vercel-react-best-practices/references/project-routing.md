# Project routing

## Apply to this app

| Area | Relevant upstream rules | Evidence expected |
| --- | --- | --- |
| React state and effects | `rerender-dependencies`, `rerender-derived-state-no-effect`, `rerender-lazy-state-init`, `rerender-move-effect-to-event` | Correct effect dependencies, no redundant derived state, and scenario or focused regression tests. |
| Component identity | `rerender-no-inline-components`, `rerender-memo`, `rerender-simple-expression-in-memo` | Avoid remounts; use memoization only for an identified expensive subtree. |
| Client rendering | `rendering-conditional-render`, `rendering-hoist-jsx`, `rendering-content-visibility` | Preserve correct output; optimize only when the list or static subtree warrants it. |
| Client requests | `async-parallel`, `async-defer-await`, `client-event-listeners` | Do not serialize independent work or duplicate global subscriptions. TanStack Query remains the cache/data-fetching layer. |
| Bundle boundaries | `bundle-barrel-imports`, `bundle-conditional`, `bundle-dynamic-imports` | Use direct imports or a split only when the dependency graph justifies it. |

## Explicit exceptions

- `server-*` rules are for Next.js/server execution and do not describe this
  Vite client. Apply the existing Supabase/RLS and server-only provisioning
  boundaries instead.
- `client-swr-dedup` is not applicable: this project already uses TanStack
  Query, and replacing it would be unrelated scope.
- Hydration rules are not applicable to the current Vite client because it has
  no SSR/hydration boundary.
- A claim such as “faster” needs a concrete reason or measurement. Prefer a
  smaller, behavior-preserving change when the cost is speculative.

## Routing examples

- “Review a new `useEffect` subscription” → inspect `rerender-dependencies`
  and the auth/session scenarios; do not rewrite it as a server rule.
- “Improve profile query caching” → inspect TanStack Query keys and auth
  transitions first; do not introduce SWR.
- “Split a large optional manager screen” → consider `bundle-dynamic-imports`
  only once that screen is in scope; this milestone has no such screen.
- “Make a fixed login form more composable” → use the composition skill first;
  this performance skill should not create a speculative abstraction.

