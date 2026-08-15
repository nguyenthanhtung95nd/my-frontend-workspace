# AI-Generated Frontend Anti-Patterns

The recurring smells in v0/AI-generated React/Next.js code, and the fix for each. Use as a
review checklist when refining generated UI — the code often *looks* finished, which is
exactly when to slow down and read it.

## State & data

| Smell | Why it hurts | Fix |
|-------|--------------|-----|
| **Redundant `useState`** (`loading`, `error`, `hasData` all tracked separately) | Verbose, brittle, states drift out of sync | Derive from one source; use SWR/React Query `isLoading/error/data` |
| **Raw `useEffect` + `useState` for data** | No cache, no dedup, refetch storms | `useSWR`/`useQuery` with a `fetcher` |
| **Unthrottled listener** (`onSnapshot` firing every 100ms) | Hammers re-renders, jank under real data | Debounce / `refreshInterval`; throttle updates |
| **No caching** — every render rebuilds state | Wasted work, inconsistency | SWR/React Query cache |
| **Hardcoded data inside the component** | Blocks real loading/error/empty; SSR/CSR too optimistic | Move to `/lib`; fetch via a data contract |
| **Mutation during render** (`products.sort(...)`) | `.sort()` mutates the source array → subtle bugs | `toSorted()` / `slice().sort()`; `useMemo` derived data |
| **Unmemoized recompute** (totals recomputed every render) | CPU churn as data grows | `useMemo` for derived collections/totals |
| **Missing loading/empty/error states** | Flicker, silent failure, layout shift | Render all three (see `error-handling-nextjs.md`) |

## Images & performance

| Smell | Why it hurts | Fix |
|-------|--------------|-----|
| **Raw `<img>`** instead of `next/image` | No lazy load, no sizing → poor LCP, layout shift (CLS) | `next/image` with `alt` + `sizes` |
| **`toFixed(2)` for money** | Wrong locale, SSR/CSR hydration mismatch | `Intl.NumberFormat` with a fixed locale |

## Structure & hygiene

| Smell | Why it hurts | Fix |
|-------|--------------|-----|
| **Everything in one `page.tsx`** | 300-line files, merge conflicts, unfindable code | Split into `/components`; data to `/lib`; `page.tsx` = layout only |
| **Unused imports** (`React`, icons, images never rendered) | Bundle bloat, hidden deps | Keep only what's rendered |
| **Mixed import aliases** (`@/` and `../../../`) | Inconsistent, fragile refactors | One alias scheme (`@/...`) |
| **AI adds unrequested elements** (a Sign-in button you never asked for) | Scope creep in the UI | Remove or explicitly adopt; keep to the spec |
| **Non-semantic markup** (chart made of `<div>` bars) | Screen readers can't announce it | Semantic `<svg>`/`<table>`, roles, labels |

## Config & safety (always override)

| Smell | Fix |
|-------|-----|
| **Hardcoded secrets** (`const apiKey = "12345"`) | Move to `.env.local`; never in code — no exceptions |
| **Disabled checks** (`ignoreBuildErrors: true`, ESLint off, `@ts-ignore`) | Re-enable; fix the underlying error |
| **Missing security headers** | Add them; treat scaffold "Security: Check" flags as real work |
| **Client-only auth/role checks** | Enforce server-side (see `SECURITY.md`) |

## Detection prompt

> Review this generated component for: redundant state, unthrottled listeners, missing
> cache, `<img>` vs `next/image`, mutation-in-render, missing loading/empty/error states,
> inconsistent imports, hardcoded secrets, and disabled checks. Report each with a fix.
