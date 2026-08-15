# Rules: Error Handling (Next.js / React)

## Every async surface has three states

A UI that fetches must render **loading, empty, and error** — not just the happy path.
Missing states cause silent failures, flicker, and layout shift (CLS). This is the single
most common AI-generated omission.

```tsx
const { data, error, isLoading } = useSWR('/api/products', fetcher)
if (isLoading) return <ProductsSkeleton />          // stable layout, no CLS
if (error)     return <ErrorState message="Couldn't load products." />
if (!data?.length) return <EmptyState />
return <ProductGrid products={data} />
```

## Boundaries

- Use **error boundaries** (`error.tsx` in App Router) for render-time failures so one
  broken subtree does not blank the whole page.
- Route handlers / server actions: `try/catch`, return **typed, sanitized** responses
  (`{ ok: false, error }` with a proper HTTP status). Never leak stack traces, internal
  paths, or secrets to the client.

## Rules

- **No silent swallowing.** At minimum log before handling; never `catch {}` empty.
- Throw specific, meaningful errors — not bare `throw new Error("failed")`.
- Show users a clear, non-technical message; keep the diagnostic detail server-side.
- Never disable safety to make an error disappear (`ignoreBuildErrors`, `// @ts-ignore`,
  disabling ESLint). Fix the cause. (A top override-worthy AI anti-pattern.)
- On forbidden (403) render an explicit "Forbidden" state, not a blank or a crash.
