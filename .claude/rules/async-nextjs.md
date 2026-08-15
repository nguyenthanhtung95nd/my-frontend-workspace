# Rules: Async & Data Fetching (Next.js / React)

## Server-first data fetching

- **Fetch on the server by default.** Prefer Server Components / server route handlers /
  server actions for data access. Only reach for client fetching when the data is
  genuinely interactive or user-specific.
- **Server vs Client boundary is explicit.** `"use client"` only where interactivity
  needs it (state, effects, event handlers). Keep it as low in the tree as possible —
  a client boundary high up drags the whole subtree to the client.
- Sensitive logic (auth checks, secrets, privileged queries) **never** runs client-side.
  See `context/architecture-nextjs.md` and the `nextjs-patterns` SECURITY reference.

## Client data — use a caching layer

- For client-side data, use **SWR or React Query**, not raw `useEffect` + `useState`.
  You get standardized `isLoading / error / data`, request dedup, and caching for free.
- **Throttle/debounce** subscriptions and high-frequency updates. An unthrottled
  listener (e.g. a Firestore `onSnapshot` firing every 100ms) will hammer re-renders.
  Use `refreshInterval` / debounce. (Common AI anti-pattern.)
- **Derive state, do not duplicate it.** `isLoading` is derivable from the data source —
  do not track `loading`, `error`, `hasData` as separate `useState` when one source
  implies them. (Common AI anti-pattern.)

## Promise discipline

- `async/await` throughout. **No floating promises** — await, `void`, or handle.
- Propagate cancellation with `AbortController` for fetches that can be superseded
  (search-as-you-type, route changes).
- Never mutate data during render. Use non-mutating operations (`toSorted`,
  `slice().sort()`) and memoize derived collections/totals with `useMemo`.

```tsx
// Bad — raw effect, redundant state, no cache, unthrottled
const [data,setData]=useState([]); const [loading,setLoading]=useState(true)
useEffect(()=>{ const u=onSnapshot(q,s=>{setData(s);setLoading(false)}); return u },[])

// Good — cached, throttled, derived state
const { data, error, isLoading } = useSWR('/api/sales', fetcher, { refreshInterval: 2000 })
```
