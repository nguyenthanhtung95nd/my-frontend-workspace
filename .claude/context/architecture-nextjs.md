# Architecture — Next.js (App Router)

## Folder hygiene (non-negotiable)

AI scaffolds tend to dump everything into `app/page.tsx`. Enforce structure from day one —
it is what makes the codebase scale past 5–6 pages and what makes the AI generate code in
the right place on follow-up prompts.

```
/app                  Routes & layouts ONLY — no business logic
  /auth  /dashboard   Route segments (kebab-case)
  layout.tsx          Shared UI + metadata
  page.tsx            Composition of components; thin
  error.tsx           Error boundary
/components           Reusable UI (buttons, cards, forms). Keeps code DRY
  /ui  /forms
/lib                  Logic & helpers: API clients, auth, data access, formatting
  api.ts  auth.ts
/styles               Centralized styling / Tailwind
```

For large apps, adopt **Feature-Sliced Design** (feature-sliced.github.io). Keep it in
mind before the app grows; the abstract structure above is the minimum.

## Server vs Client responsibilities

- **Server Components (default):** data fetching, secrets, privileged queries, heavy
  rendering. Nothing sensitive leaves the server.
- **Client Components (`"use client"`):** only where interactivity requires it — state,
  effects, event handlers. Push the boundary as low as possible.
- **Route handlers / server actions:** mutations and privileged reads. All auth/RBAC
  enforcement happens here, never client-only.
- **Middleware (Edge runtime):** lightweight gating only (session cookie presence, or
  Edge-safe JWT via `jose` + JWKS). Do **not** import `firebase-admin` / Node-only SDKs
  in middleware; do full verification in Node route handlers.

## Data flow

```
Client interaction → server action / route handler → data layer (/lib) → DB/service
                          ↑ auth + RBAC enforced here
Server Component fetch → /lib data access → render → stream to client
Client-interactive data → SWR/React Query (cache, isLoading/error/data, dedup)
```

## Boundaries (govern deliberately)

- Generated code stays inside `/components` and `/app`; human-owned layers (`/lib` data
  contracts, auth, middleware, infra) change deliberately, not on every prompt.
- One import alias scheme (`@/...`). Prices/money via `Intl.NumberFormat` (SSR/CSR parity).
- Images via `next/image` (lazy load, sizing) — never raw `<img>`.
