---
allowed-tools: Read(*), Bash(git*), Bash(npm:*), Bash(pnpm:*), Bash(node:*)
description: Map a new frontend codebase and populate the Environment Facts table in CLAUDE.md. Read-only — suggests nothing to change during onboarding. Run once when setting up a project.
---

# Onboard to a New Codebase

You are a senior frontend engineer helping orient a developer to an unfamiliar
**Next.js / React / TypeScript** codebase so they can contribute safely and quickly.

## Context
Stack: Next.js (App Router) · React · TypeScript · Tailwind. Data: SWR / React Query.
BaaS: Firebase (Auth, Firestore) · Stripe. Deploy: Vercel.
Goal: understand the codebase well enough to change it safely — as fast as possible,
without breaking things. Mindset: read first, understand second, contribute third.

## Constraints
- Do not modify any code during onboarding.
- Flag anything unclear rather than guessing.
- Identify risks before recommending where to start.
- Map dependencies (data flow, shared `/lib`, client/server boundary) before suggesting changes.
- "I don't know" is a valid output — document it rather than inventing an answer.

## Onboarding Levels

### Level 1 — Orientation (Day 1)
Goal: understand what this system does and how it is structured.
1. What is the business domain and purpose of the app?
2. What are the primary user-facing features and routes?
3. What is the rendering strategy — mostly Server Components, or client-heavy?
4. What are the core data entities / collections?
5. What external systems does it integrate with (Firebase, Stripe, REST APIs)?

Deliverable: a mental map a new engineer can explain to someone else.

### Level 2 — Navigation (Days 2–3)
Goal: know how to find things and how data flows.
1. How is the project structured — what lives in `/app`, `/components`, `/lib`, `/styles`?
2. How does a user action flow — component → server action / route handler → data layer
   (`/lib`) → Firestore/API → back?
3. Where is configuration and env managed (`.env.local`, `next.config`, `NEXT_PUBLIC_*`)?
4. Where are tests, and what is the strategy (Jest + RTL, MSW, Playwright)?
5. How are authentication and RBAC handled — and **where is each enforced** (client vs
   server vs Firestore rules)?
6. What is the deploy process (Vercel preview/prod, envs)?

Deliverable: can locate any piece of code when asked.

### Level 3 — Contribution Readiness (Week 1)
1. What are the team's conventions (component structure, naming, import aliases)?
2. Which patterns recur — SWR data contract, custom hooks, server-first fetching?
3. What are the known issues / tech debt (raw `<img>`, client-only auth, `any`, missing states)?
4. Which areas are fragile or high-risk (auth, payments, data layer, middleware)?
5. What is tested, and what is not covered?
6. What would break if a given piece of code changed?

Deliverable: can make changes safely and with confidence.

## Analysis Framework

**Step 1 — Entry points**
Identify all ways users/data enter: page routes (`/app/**/page.tsx`), route handlers
(`/app/api/**/route.ts`), server actions, middleware, webhooks (e.g. Stripe). For each:
what it does and who calls it.

**Step 2 — Core data model**
Identify the 5–10 most important entities / Firestore collections and their relationships
and invariants (e.g. "an order always belongs to a user"). Look for the data-access layer
in `/lib`, the type definitions, and where validation lives.

**Step 3 — Data flow & boundary**
Trace a typical journey (e.g. add to cart → checkout) through every layer. Note the
Server/Client boundary (`"use client"`), where fetching happens (server vs SWR), and where
each step can fail (loading / empty / error / forbidden states).

**Step 4 — Risk map**
Highest-risk areas: auth & RBAC, Stripe payments, Firestore/Storage security rules, the
`/lib` data layer, middleware. Note areas with no tests, `TODO`/`HACK`/`FIXME`, and code
changed recently (use `git log`).

**Step 5 — Convention extraction**
Read 3–5 existing implementations of the same pattern — three components, three custom
hooks, three route handlers. What they share is the convention; what varies is either
inconsistency or intentional variation.

**Step 6 — Environment Facts (write into CLAUDE.md)**
Detect the real environment and record it in the `### Environment Facts` table under
`## Project Context` in `.claude/CLAUDE.md`. **Preserve all other content — only fill/update
that table.**

- Use **PowerShell commands only** (this session runs in PowerShell, not bash).
- Detect only what is relevant: OS, PowerShell version, Node.js (`node --version`), package
  manager (presence of `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`), Next.js
  version (`package.json`), backend/BaaS (Firebase config, REST host, or "none"), deploy
  target (`vercel.json` / project settings, or "unknown").
- Do **not** scan for unrelated toolchains (.NET, Go, Rust, Ruby).
- Environment facts are hard facts, not preferences — if a value can't be determined, write
  "unknown" rather than guessing.

## Output Format

### System Overview
```
System:       [name]
Domain:       [business problem it solves]
Scale:        [users, traffic — if determinable]
Rendering:    [server-first | client-heavy | hybrid]
Tech stack:   [Next.js version, React, TS, styling, BaaS, deploy]
```

### Architecture Map
```
Entry points:
→ [route / route handler / action]: [purpose]

Core entities / collections (top 5):
→ [entity]: [role in the system]

Key integrations:
→ [Firebase / Stripe / API]: [how it is used]

Main data flow:
[Component] → [server action / route handler] → [/lib data access] → [Firestore/API]
             ↑ auth + RBAC enforced here
```

### Convention Summary
```
Data fetching:   [Server Components | SWR | React Query | mixed]
State/derivation:[derived from source | redundant useState — flag it]
Client boundary: [pushed low | too high — flag it]
Auth/RBAC:       [server-enforced | client-only — flag it]
Test framework:  [Jest + RTL + MSW | Playwright | coverage level]
Naming/aliases:  [PascalCase components, useX hooks, @/ alias | inconsistencies]
```

### Risk Map
```
🔴 High risk — touch only after thorough understanding:
   [area]: [why it is risky]

🟡 Medium risk — touch with tests in place:
   [area]: [what to be careful about]

🟢 Safe to change — well-tested and isolated:
   [area]: [why it is safe]
```

### Knowledge Gaps
```
Not yet understood:
- [component or pattern]: [what is unclear]
  Suggested next step: [who to ask or what to read]
```

### Safe First Contributions
```
Low-risk starting tasks (high learning value):
1. [task]: [why it is a good first contribution]

Areas to avoid until week 2 or later:
1. [area]: [reason to wait]
```

### Questions for the Team
```
Before modifying anything, I need to understand:
1. [question]: [why it matters]
```
