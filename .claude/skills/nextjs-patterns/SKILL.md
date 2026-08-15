---
name: nextjs-patterns
description: >
  Next.js / React / TypeScript-specific patterns for AI-assisted development — the thin
  framework layer on top of the framework-agnostic `frontend-craft` skill. Covers Server
  vs Client Components, hydration, next/image, the SWR data-contract, React AI anti-patterns,
  and Next/Firebase security. Auto-loads on .tsx, .jsx, next.config, and Tailwind files.
context: auto
---

# Next.js / React Patterns (AI-Assisted)

This is the **React/Next-specific layer**. The universal frontend mindset — semantic HTML,
CSS craft, accessibility, responsive design, the override-vs-accept judgment, and the UI
prompt framework — lives in **`frontend-craft`** and applies here unchanged. This skill only
adds what is specific to React and Next.js.

> Read `frontend-craft` first for the craft; read this for how React/Next expresses it.

## Server vs Client (the Next-specific boundary)

- **Server Components by default** — data fetching, secrets, privileged queries. Add
  `"use client"` only where interactivity needs it (state, effects, handlers), as low in the
  tree as possible. A high client boundary drags the whole subtree to the browser.
- **Route handlers / server actions** own mutations and privileged reads; all auth/RBAC is
  enforced here, never client-only. (See SECURITY.md.)
- **Hydration**: server and client render must agree — guard `Date`/locale/random/`window`;
  format money with `Intl.NumberFormat` (never `toFixed`).

## Folder hygiene (Next specifics)

`/app` = routes + layouts only · `/components` = reusable UI · `/lib` = logic/API/auth ·
`/styles`. (The general principle is in `frontend-craft`; this is the Next directory shape.)
See `context/architecture-nextjs.md`.

## Reference files

- **[AI-ANTI-PATTERNS.md](AI-ANTI-PATTERNS.md)** — React-flavored AI smells + fixes:
  redundant `useState`, raw `useEffect` fetching, unthrottled listeners, `<img>` vs
  `next/image`, mutation-in-render. Read when reviewing/refining generated React.
- **[PERFORMANCE-DATA.md](PERFORMANCE-DATA.md)** — Core Web Vitals via Next (`next/image`,
  RSC streaming) and the client data-contract (SWR/React Query). Read when optimizing.
- **[SECURITY.md](SECURITY.md)** — server-side-by-default, RBAC prompt checklist, Firebase
  rules, middleware. Read on anything touching auth, roles, or sensitive data.

For accessibility, semantic markup, CSS layout, and the R‑G‑C‑S‑A‑O‑V prompt scaffold, see
**`frontend-craft`** — do not duplicate it here.

## Prototyping UI

For "what should this look like", use `build-prototype` (it asks how to build: text
wireframe, local HTML/CSS, shared artifact, or in-app React variants) before committing to
production components. Prototype code is exempt from the always-on rules and `/code-review`.
