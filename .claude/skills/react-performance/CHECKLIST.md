# Performance audit scorecard

Profile first. For each item, score **present / partial / missing / n-a**, note the measured impact,
then rank fixes by profiled cost -- not by this list order. Details per area live in [playbook/](playbook/).

## 0. Measurement
- [ ] Reproduced on a throttled device (CPU 4-6x, slow network)
- [ ] React Profiler + Chrome Performance capture taken before changing code
- [ ] Before/after numbers recorded for each change

## Render model ([01](playbook/01-render-model.md))
- [ ] Stable element type + position; conditional content, not conditional elements
- [ ] Lists keyed by stable id (never index/random)
- [ ] Prop/callback/object identity stabilized only where it matters
- [ ] Components split along state boundaries; state colocated, lifted only when shared

## State & context ([02](playbook/02-state-and-context.md))
- [ ] Derived values computed, not stored (single source of truth)
- [ ] Context value memoized; contexts split by domain/frequency
- [ ] High-frequency data kept out of context (local/ref/external store/URL)
- [ ] State and actions split where writers should not re-render on state change

## Memoization & Compiler ([03](playbook/03-memoization-and-compiler.md))
- [ ] Memoization applied only to profiled hotspots (not reflexively)
- [ ] `React.memo` custom equality compares only render-relevant fields (returns true = skip)
- [ ] React 19 Compiler evaluated; manual memo removed where it now handles it

## Concurrent ([04](playbook/04-concurrent.md))
- [ ] Expensive non-urgent updates in `startTransition`/`useDeferredValue`
- [ ] `use()` promises memoized (no render loop); no request waterfalls
- [ ] `useLayoutEffect`/`flushSync` used only for measure/flicker cases

## Bundle & assets ([05](playbook/05-bundle-and-assets.md))
- [ ] Route + heavy-component code-splitting with Suspense + error boundary
- [ ] Bundle analyzed; duplicates/oversized deps removed; tree-shaking intact
- [ ] Images sized (no CLS), modern formats, lazy below fold, LCP image NOT lazy
- [ ] Content-hashed assets cached immutable; HTML not cached
- [ ] Preload/preconnect/prefetch used with intent (not "just in case")

## Server rendering ([06](playbook/06-server-rendering.md)) -- if SSR/RSC
- [ ] `'use client'` pushed down to islands; only serializable props cross
- [ ] Suspense boundaries page-level; fetches started early (no waterfalls)
- [ ] Streaming SSR; no hydration mismatches (`useId`, no Date/random in render)
- [ ] `tsc --noEmit` in CI (SWC does not type-check)

## Vitals, monitoring & testing ([07](playbook/07-vitals-monitoring-testing.md))
- [ ] LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 on throttled field-like conditions
- [ ] Long tasks (>50ms) broken up / yielded / offloaded
- [ ] RUM in production (GATED); budgets enforced in CI (GATED)

## Lists, animation & advanced ([08](playbook/08-lists-animation-advanced.md))
- [ ] Long lists virtualized (>~50 items) with a11y restored
- [ ] Animations use transform/opacity only; `will-change` added then removed
- [ ] CPU-heavy work offloaded to a worker; memory leaks checked (4 culprits)
- [ ] Realtime updates throttled/batched/virtualized (GATED backend)

> Perf test mechanics live in **frontend-unit-testing**; Lighthouse/Playwright-in-CI lives in
> **automate-e2e-self-testing**. This scorecard stops at diagnosing and fixing React runtime perf.
