# Performance & Data (Next.js / React)

The Next/React-specific slice of performance and data. General Core Web Vitals thinking and
accessibility live in `frontend-craft`; this is how Next expresses them.

## Core Web Vitals via Next

Workflow: **Measure → Fix → Re-measure** (Lighthouse CI). Don't optimize blind.

| Metric | Next-specific lever |
|--------|---------------------|
| **LCP** | `next/image` (lazy + sizing) instead of `<img>`; prioritize the hero; stream server data from Server Components instead of blocking client fetches |
| **CLS** | `next/image` with `width/height`/`sizes`; skeletons for loading states |
| **INP** | keep the `"use client"` boundary low (less JS shipped); debounce listeners; `useMemo` expensive derived data; `dynamic()` for heavy client-only components |

- Prefer **Server Components** so less JS reaches the browser; only what's interactive is a
  Client Component.
- `next/image` always (lazy load, correct `sizes`) — never raw `<img>`.

## The client data-contract

Every client-side data source standardizes on SWR (or React Query):

```tsx
const { data, isLoading, error } = useSWR(key, fetcher, { refreshInterval })
```

- `isLoading` → skeleton (stable layout, no CLS)
- `error` → explicit error state
- empty (`!data?.length`) → empty state
- `refreshInterval` → throttled refresh + request dedup across components

This gives QA explicit states to verify and keeps layout stable under real I/O. Do **not**
hand-roll `useEffect` + multiple `useState` for data (see AI-ANTI-PATTERNS).

## Server-side fetching

Fetch in Server Components / route handlers by default; reach for client fetching only for
genuinely interactive or user-specific data. Secrets and privileged queries never run
client-side.
