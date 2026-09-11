# 08 - Lists, animation and advanced

## Windowing / virtualization
Render only the rows in the viewport (plus a small overscan) instead of the full dataset -- thousands
of DOM nodes freeze the UI and bloat memory.
```tsx
// fixed-size rows; apply the injected style to each row's root, pass data via itemData (stable ref)
<FixedSizeList height={600} itemCount={items.length} itemSize={48} itemData={items}>
  {Row}
</FixedSizeList>
```
Use a variable-size list with a deterministic `getItemSize` for dynamic heights, memoize rows, and
tune `overscanCount`. Restore accessibility (`role`, `aria-setsize`, `aria-posinset`) and clean up row
effects. Skip virtualization below ~50 items.

## Perceived performance: skeletons
Show a structural placeholder matching the final layout, driven by CSS (not JS) animation. Delay it
~200ms so fast requests never flash it, and enforce a ~500ms minimum once shown. Match dimensions to
avoid CLS; add `role="status"` / `aria-busy`.

## Compositor-only animation
The frame budget is ~16.67ms. Animate **only `transform` and `opacity`** -- they run on the GPU
compositor and skip layout/paint. Animating `width`, `height`, `top`, `left`, or `margin` triggers the
full pipeline and drops frames.
```tsx
// expand via transform, not animated height; use FLIP for reorder animations
element.style.transform = `translateY(${delta}px)`;
```
Add `will-change: transform` as a hint and remove it when done (permanent `will-change` spawns excess
GPU layers). Gate animations on visibility with `IntersectionObserver`; prefer the Web Animations API
(`element.animate(...)`, `await animation.finished`) for imperative sequences off the main thread; use
the View Transitions API (`document.startViewTransition`) for route/state morphs, always with a
feature-detected fallback and `prefers-reduced-motion`. Reading `getBoundingClientRect`/`scrollHeight`
mid-animation forces a synchronous layout.

## Off-main-thread work (GATED where noted)
- **Web Workers** for CPU-heavy work (anything > ~16ms blocks rendering): a typed `postMessage`
  protocol wrapped in a `useWebWorker` hook, one reused worker or a pool sized to
  `navigator.hardwareConcurrency`, and Transferable buffers for large binary data. Workers cannot
  touch the DOM/React; always `terminate()` on cleanup. (`SharedArrayBuffer` is GATED -- needs
  COOP/COEP headers.)
- **WebAssembly** only where it beats JS (math-heavy, 10k+ elements) -- free every `malloc`; it loses
  on simple/high-frequency/small-data/DOM work.
- **OffscreenCanvas** (`transferControlToOffscreen`) moves canvas/WebGL rendering into a worker.
- **Service workers** (GATED: HTTPS/prod) for offline-first caching, per-type strategy (cache-first
  images, network-first API, stale-while-revalidate HTML).

## Memory
Leaks are invisible in dev and fatal in long sessions. The four culprits: uncleaned listeners,
uncleared timers, large objects captured in `useMemo`/`useCallback` deps, and unremoved
subscriptions. Detect by diffing `performance.memory.usedJSHeapSize` (Chromium-only) around
mount/unmount, or mount/unmount N times and assert < 1MB growth. Keep large stable data in a ref (no
closure capture), use a `WeakMap` for component metadata, and store ids + a `Map` instead of
duplicating objects in state. Always clean up effects.

## Realtime at scale (GATED: streaming backend)
The bottleneck is rendering, not the network -- each message -> `setState` -> reconciliation. Throttle
updates to one per frame (~16ms), batch with backpressure (drop oldest/newest/sample when the queue
overflows), aggregate by key (e.g. collapse ticks per symbol, flush every 100ms), and virtualize the
view. Reconnect WebSockets with exponential backoff and a heartbeat; use SSE (`EventSource`,
`lastEventId`) for one-way streams; unsubscribe on unmount and keep bounded history (`slice(-1000)`).
React 18 auto-batches, so avoid dated manual-batching patterns.
