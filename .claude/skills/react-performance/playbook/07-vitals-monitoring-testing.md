# 07 - Vitals, monitoring and testing

Optimize the metrics that reflect real user experience, measure them in the field, and gate
regressions in CI.

## Core Web Vitals (the targets)
| Metric | Good | React levers |
|--------|------|--------------|
| **LCP** (load) | <= 2.5s | preload hero, `fetchpriority="high"`, never lazy-load the LCP element, inline critical CSS, SSR/streaming, AVIF/WebP |
| **INP** (interaction) | <= 200ms | `useTransition`/`useDeferredValue`, time-slice, Web Workers, debounce handlers |
| **CLS** (stability) | <= 0.1 | set image `width`/`height` or `aspect-ratio`, size skeletons to content, `font-display: swap` + size-adjusted fallback |

Throttle CPU/network to mimic a low-end phone -- lab-only optimization misleads.

## INP and long tasks
INP = input delay + processing + presentation. Any script over ~50ms is a long task that freezes the
UI. Break work up:
```ts
// yield to the main thread between chunks
for (const chunk of chunks) { process(chunk); await new Promise(r => setTimeout(r, 0)); }
```
Use `requestIdleCallback` for non-urgent work, `scheduler.postTask` with priorities + an
`AbortController`, event delegation over per-item listeners, and batch DOM reads then writes. Update
an input's value synchronously but defer the expensive search.

## Profiling (do this before changing code)
- **React DevTools Profiler:** record an interaction, read the flamegraph (wide bars = slow), and use
  "why did this render?" -- a "props changed" reason often means a recreated inline object/function.
- **Chrome Performance panel:** find main-thread long tasks, forced reflows, GC, and paint storms;
  throttle CPU 4-6x. Add `performance.mark`/`measure` spans; take heap snapshots for leaks.
Keep recordings short (3-10s) and never ship the Profiler enabled.

## RUM -- real user monitoring (GATED: needs a backend)
Field data beats lab data: real devices produce delays a dev machine never shows.
```ts
import { onLCP, onINP, onCLS } from 'web-vitals';
onINP((m) => sendBeacon('/rum', { ...m, conn: navigator.connection?.effectiveType }), { reportAllChanges: true });
```
Sample (~10%), send on `visibilitychange`/`pagehide` via `sendBeacon`, segment by route/device/
network, and track p75/p95/p99. `performance.memory` is Chromium-only. Measure INP after paint
(nested `requestAnimationFrame`).

## Budgets and testing in CI (GATED: CI infra)
Turn "make it faster" into enforced numbers set from a real baseline (p75 + a 10-20% buffer), not
aspiration:
- **Bundle budget:** `size-limit` on gzipped assets in a pre-push hook + a ~5% regression gate.
- **Lighthouse CI:** multi-run assertions on perf score, LCP/INP/CLS/TBT, and resource budgets.
- **Component render budget:** a Profiler-based unit matcher (`toRenderWithinTime`, `toHaveMaxReRenders`).
Run several iterations for statistical stability and keep a rolling baseline. The test *mechanics*
live in **frontend-unit-testing**; wiring Lighthouse/Playwright into the pipeline lives in
**automate-e2e-self-testing**.
