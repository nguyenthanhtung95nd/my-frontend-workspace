---
name: react-performance
description: Diagnoses and fixes React runtime performance -- wasted re-renders, slow interactions, large bundles, poor Core Web Vitals -- with a profiling-first, React 19-aware method. Use when a React app feels slow, when optimizing render/memoization/bundle/images, tuning Core Web Vitals (LCP/INP/CLS), adopting the React Compiler / concurrent features / RSC, virtualizing long lists, or wiring performance budgets.
---

# React Performance

Make React apps fast by **doing less work and doing it off the critical path**. The order that
matters: measure first, fix the render model, then reach for memoization, then ship less code.

## Rule zero: measure before and after
Optimization without a profile is guessing. Reproduce on a throttled device (CPU 4-6x, slow 3G),
find the real bottleneck with the React Profiler + Chrome Performance panel, change one thing, then
re-profile to prove it. A "props changed" re-render reason usually means a recreated inline
object/function, not real new data.

## Step 0 -- Detect, then pick a mode
Inspect: React version (18 vs 19), framework (Vite / Next / RSC), whether the React Compiler is on,
build tooling (Babel/SWC), and where the pain is (initial load vs interaction vs list vs animation).

- **Bootstrap** -- a fresh optimization pass on a slow area: profile -> apply the matching playbook -> verify.
- **Audit** -- score the app against [CHECKLIST.md](CHECKLIST.md) and rank fixes by measured impact.

## The playbook (fix in this order)
1. **Render model** -- reconciliation, stable keys/identity, component granularity, state colocation/lifting. See [playbook/01-render-model.md](playbook/01-render-model.md).
2. **State & context** -- derive don't store; context is a broadcast, split it; keep high-frequency data out. See [playbook/02-state-and-context.md](playbook/02-state-and-context.md).
3. **Memoization & the Compiler** -- `useMemo`/`useCallback`/`React.memo` as a scalpel; let the React 19 Compiler auto-memoize. See [playbook/03-memoization-and-compiler.md](playbook/03-memoization-and-compiler.md).
4. **Concurrent features** -- transitions, `useDeferredValue`, `use()`, `useActionState`, selective hydration. See [playbook/04-concurrent.md](playbook/04-concurrent.md).
5. **Bundle & assets** -- code-split, tree-shake, analyze, optimize images, cache immutable assets, preload with intent. See [playbook/05-bundle-and-assets.md](playbook/05-bundle-and-assets.md).
6. **Server rendering** -- RSC, Suspense data, streaming SSR, SWC. See [playbook/06-server-rendering.md](playbook/06-server-rendering.md).
7. **Vitals, monitoring & testing** -- Core Web Vitals, INP/long-tasks, RUM, perf budgets in CI. See [playbook/07-vitals-monitoring-testing.md](playbook/07-vitals-monitoring-testing.md).
8. **Lists, animation & advanced** -- virtualization, skeletons, compositor-only animation, workers/WASM, memory, realtime. See [playbook/08-lists-animation-advanced.md](playbook/08-lists-animation-advanced.md).

## Tooling policy (enterprise-safe)
- **Local-first (use freely):** the React Profiler, Chrome DevTools, bundle analyzers, tree-shaking,
  image optimization, virtualization, memoization, compositor-only animation, memory tooling.
- **GATED -- needs org/IT approval or specific infra:** RUM/monitoring backends, CDN/edge config,
  service workers (HTTPS), RSC/streaming-SSR hosts, realtime backends, `SharedArrayBuffer` (COOP/COEP),
  and any external analytics. Flag these; prefer a local-first measurement first.

## Golden rules
- The fastest work is work you do not do -- prefer deleting/deferring code over caching it.
- On React 19 with the Compiler on, **delete** manual memoization and keep only custom-equality
  cases; hand-memoizing what the compiler already handles is dead weight.
- Perf tests belong in the pyramid -- unit render-time + budgets; see **frontend-unit-testing** for the
  test mechanics and **automate-e2e-self-testing** for Lighthouse/Playwright in CI.

Templates: [templates/vite.config.ts](templates/vite.config.ts), [templates/profiling-and-budgets.md](templates/profiling-and-budgets.md).
