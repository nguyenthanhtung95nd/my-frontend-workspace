# 06 - Server rendering

Moving work to the server ships less JS and reveals content sooner. GATED: everything here needs a
server runtime and (for RSC) an RSC-capable framework.

## React Server Components (RSC)
Default components to the server; add `'use client'` only at the interactivity boundary.
```tsx
// server component: async, reads data directly, ships zero JS
export default async function ReportPage({ id }: { id: string }) {
  const report = await db.report.find(id);        // no API layer, no loading state
  return <ReportView report={report}><LikeButton reportId={id} /></ReportView>;
}
// LikeButton.tsx
'use client';                                      // interactivity island
```
Only serializable props cross the boundary (no functions). Every child of a client component becomes
client too -- push `'use client'` **down** to small islands. Never import server-only modules into
client code. Compose with Suspense to stream slow sections.

## Suspense for data fetching
Wrap async subtrees so ready content shows while slow parts load:
```tsx
<Suspense fallback={<Skeleton />}><SlowSection /></Suspense>
```
Use render-as-you-fetch: start the request early (warm a cache before render), throw the in-flight
promise, and cache the result. Do **not** start the fetch inside the consuming component's render
(waterfall), add cache invalidation after mutations, and do not wrap the whole app/router in one
boundary (it suspends everything on navigation) -- use page-level boundaries.

## Streaming SSR
Send the shell immediately, stream slower sections as their data resolves (TTFB can drop below 100ms,
improving LCP):
```tsx
renderToPipeableStream(<App />, {
  bootstrapScripts: ['/main.js'],
  onShellReady() { res.setHeader('content-type', 'text/html'); this.pipe(res); },
  onShellError() { /* fall back to client render */ },
});
```
Wrap slow `lazy()` sections in Suspense and order boundaries by priority. Preload critical fetches in
the request handler and pass promises down (`use()` to unwrap); run independent fetches with
`Promise.allSettled`; dedup identical fetches with a promise cache. Avoid hydration mismatches: no
`Date.now()`, random ids, or browser APIs during render -- set those in `useEffect`, and use `useId`
for stable ids.

## SWC instead of Babel
SWC (Rust) transforms and minifies JSX/TS ~10-20x faster, speeding dev startup, HMR, and builds.
```ts
// Vite
import react from '@vitejs/plugin-react-swc';
```
Next.js 12+ uses SWC by default. **SWC strips types but does not type-check** -- keep `tsc --noEmit`
in CI. Its plugin ecosystem is smaller than Babel's. (Local-first: build-tool config.)
