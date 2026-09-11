# 05 - Bundle and assets

The cheapest render is the one whose code never shipped. Ship less JS, then load what remains in the
right order.

## Code-splitting and lazy loading
```tsx
const Editor = lazy(() => import('./Editor'));
<Suspense fallback={<Skeleton />}><Editor /></Suspense>   // missing Suspense throws
```
Split at the router level, and lazy-load conditional UI (modals, editors), role-gated views, and
heavy libs (`useEffect(() => import('lib').then(...))`). Wrap lazy trees in an error boundary for
chunk-load failures. Do not over-split (< ~10KB adds request overhead).

## Bundle analysis
Treat the bundle as data. Add an analyzer gated by an env flag, and read three sizes -- stat, parsed,
and **gzip** (gzip approximates the network cost). Audit for duplicate framework copies (dedupe via a
resolve alias), unused exports, and oversized libraries. Enforce per-bundle byte thresholds plus a
~5% regression budget in CI and fail the build on breach.

## Tree-shaking
Keep imports statically analyzable and side-effect-free:
```ts
import debounce from 'lodash/debounce';   // specific import, not `import * as _`
```
Use ES modules only (CommonJS cannot shake), set `"sideEffects": false` (or list CSS/polyfills) in
`package.json`, and enable `usedExports` with Babel `modules: false`. Barrel files, `export *`,
dynamic `require`, and global-mutating "pure" functions all defeat shaking. A tiny utility
(debounce/throttle) is often cheaper hand-written than a dependency.

## Images (often 60-70% of page weight)
```tsx
<picture>
  <source type="image/avif" srcSet={avif} />
  <source type="image/webp" srcSet={webp} />
  <img src={fallback} width={800} height={600} loading="lazy" decoding="async" alt="..." />
</picture>
```
Always set `width`/`height` (or `aspect-ratio`) to prevent CLS. Provide `srcSet` + `sizes` across
widths and account for `devicePixelRatio`. Lazy-load below the fold -- but **never lazy-load the LCP
image** (preload it, `fetchpriority="high"`). ~85% quality is usually enough. At scale, push
transforms to a CDN (`format=auto`, width/dpr) and cache originals `immutable`.

## Caching immutable assets
Content-hash every asset (`[name].[contenthash].js`) and cache hashed files
`public, max-age=31536000, immutable`; never cache HTML (`no-store`). Split framework / large-libs /
commons / async chunks so stable code caches independently -- poor chunking makes everything change
together and kills the edge hit rate.

## Preload with intent (not "just in case")
- `<link rel="preload">` above-the-fold fonts (`crossorigin`), critical CSS, and the hero image.
- `rel="preconnect"` (limit 2-3) for API/CDN origins; `dns-prefetch` for minor third parties.
- `rel="prefetch"` / framework `preload()` next-route bundles on hover/focus/visibility.
- `modulepreload` for code-split chunks.
Over-preconnecting exhausts the ~6-connection budget. Respect `Save-Data` / a slow `effectiveType`.

## Instant navigation
Speculation Rules (`<script type="speculationrules">`, `eagerness` conservative -> eager) can
prerender/prefetch likely next pages. Keep pages bfcache-eligible: use `pagehide`/`pageshow`
(`event.persisted`), not `unload`/`beforeunload`; close WebSockets and pause timers on hide, resume on
show. An open WebSocket or an `unload` handler disqualifies bfcache. (GATED: needs CDN/host support.)
