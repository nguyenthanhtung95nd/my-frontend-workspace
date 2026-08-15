# Pre-PR Checklist (Next.js / React / TypeScript)

Before opening a Pull Request, verify every item.

## Code Quality
- [ ] Components small and focused; `/app` holds routes+layouts only, logic in `/lib`
- [ ] No copy-pasted logic — extracted into a component, hook, or `/lib` helper
- [ ] No magic numbers/strings — named `const`
- [ ] No boolean positional args — explicit variants/props
- [ ] Consistent import aliases (`@/...`); no unused imports
- [ ] No `any`; props/types are precise
- [ ] No commented-out code

## AI Anti-Patterns (see nextjs-patterns/AI-ANTI-PATTERNS.md)
- [ ] No redundant `useState` — state derived from one source
- [ ] Client data via SWR/React Query (cached, deduped), listeners throttled/debounced
- [ ] No mutation during render (`toSorted()` not `.sort()`); expensive derived data memoized
- [ ] `next/image` with `alt` + `sizes` — no raw `<img>`
- [ ] Money via `Intl.NumberFormat` — no `toFixed`

## Server/Client & Data
- [ ] `"use client"` only where needed, boundary kept low
- [ ] Every data-driven UI renders loading + empty + error states
- [ ] No hydration mismatches (locale/`Date`/random guarded)

## Accessibility
- [ ] Semantic structure; roles/labels; `aria-hidden` on decorative icons
- [ ] Keyboard operable; visible focus; WCAG AA contrast

## Security
- [ ] No hardcoded secrets/keys — `.env.local`; server secrets off `NEXT_PUBLIC_*`
- [ ] Auth/RBAC enforced server-side (route handlers + datastore rules); client checks UX-only
- [ ] Input sanitized/validated; no unsafe `dangerouslySetInnerHTML`; security headers set
- [ ] No PII in client logs or error messages

## Tests
- [ ] Components/hooks tested for happy + loading + empty + error (query by role)
- [ ] E2E covers auth-gated + RBAC paths; no `.skip` without a linked issue
- [ ] `npm test` (and `npx playwright test` where relevant) pass locally

## Build & Checks
- [ ] `npm run build` / `tsc --noEmit` clean — no `ignoreBuildErrors`, `@ts-ignore`, ESLint disabled
- [ ] No console errors/warnings in the browser
