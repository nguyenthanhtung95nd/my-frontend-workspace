# Claude Code — Frontend Master Workspace

Sibling to `my-engineering-workspace` (the .NET backend workspace). Copy this `.claude/`
into a Next.js / React / TypeScript repo. The two workspaces share the same stack-agnostic
core (pipeline, agents, rules about structure/design/safety); this one carries the
frontend stack layer.

## Who I Am
- Full-stack developer; this workspace is for my **frontend** work
- Building modern web apps with Next.js (App Router) + React + TypeScript
- AI-assisted development (v0 / Claude Code) hardened to production quality
- Agile / Scrum — sprint-based, user story driven

## Tech Stack
- **Next.js (App Router)** · React · TypeScript · Tailwind CSS
- Data/UI: SWR or React Query · shadcn/ui
- Backend-as-a-service: Firebase (Auth, Firestore) · Stripe (payments)
- Testing: Jest · React Testing Library · MSW · Playwright
- Deploy: Vercel

## How I Work With You

1. Default language is TypeScript/React unless I say otherwise
2. **AI output is a sketch; production is the goal.** "Runs locally" ≠ production-ready.
3. Follow TS/React conventions — no `any`, server-first data, folder hygiene
4. Accessibility and Core Web Vitals are requirements, not afterthoughts
5. Enforce security server-side — client checks are UX only

## Response Format
- Code first, explanation after
- Brief explanation of key decisions
- Call out AI anti-patterns and unhandled states (loading/empty/error)
- Show trade-offs when multiple approaches exist

---

## Feature Development Pipeline

```
Vague idea
    ↓
grill-me          → shared understanding (one question at a time)
    ↓
write-a-prd       → prd/{feature}-prd.md
    ↓
prd-to-plan       → plans/{feature}-plan.md
    ↓
scratchpad        → scratchpad/{feature}-scratchpad.md   (non-trivial changes only)
    ↓
do-work           → code + tests + Work Summary
    ↓
ship-feature      → /code-review → /security-review → /test-coverage → /pr-summary
```

**UI is mockup-first.** A frontend task arrives one of two ways:
- **Mockup exists** → `do-work` (implement it to the `frontend-craft` standard).
- **Only a behaviour spec** → `grill-me` (clarify) → **`build-prototype`** (settle the look
  — it asks: wireframe / local HTML-CSS / shared artifact / in-app variants) → `do-work`.

Never write production UI from a fuzzy spec without seeing the interface first.
`build-prototype` is reachable directly and from `grill-me`/`do-work`.

Zero-to-production greenfield guide: `docs/HOW-TO-BUILD-A-PROJECT.md` (language-agnostic).

---

## Frontend Context
@.claude/context/architecture-nextjs.md
@.claude/context/templates-nextjs.md
@.claude/context/testing-nextjs.md

---

## Engineering Standards (always active)

Stack-agnostic core:
@.claude/rules/structure.md
@.claude/rules/design-principles.md
@.claude/rules/comments.md
@.claude/rules/safe-modification.md

Frontend stack:
@.claude/rules/naming-typescript.md
@.claude/rules/methods-and-components.md
@.claude/rules/async-nextjs.md
@.claude/rules/error-handling-nextjs.md
@.claude/rules/testing-nextjs.md
@.claude/rules/checklist.md

---

## Subagents (invoked automatically)

| Situation | Subagent |
|-----------|----------|
| Any error, test failure, unexpected/hydration behavior | **debugger** |
| Need tests for a component, hook, or flow | **test-generator** |
| Slow page, jank, poor Core Web Vitals | **performance-analyzer** |
| Any question about a library, framework, or SDK | **docs-explorer** |

Code review and security review run as the pre-PR **commands** (`/code-review`,
`/security-review`) via `ship-feature` — not as continuous agents.

---

## Skills

| Skill | Trigger |
|-------|---------|
| `grill-me` | Sharpen a vague idea before writing PRD |
| `write-a-prd` | Create a structured PRD |
| `prd-to-plan` | Turn PRD into phased implementation plan |
| `scratchpad` | Persistent working memory for a non-trivial change; holds Recovery workflow |
| `do-work` | Implement feature or fix — build/test loop |
| `ship-feature` | Pre-PR orchestrator — runs all 4 review steps |
| `build-prototype` | Throwaway UI mockup — asks output: wireframe / local HTML-CSS / shared artifact / in-app variants; or logic/state. Central to FE work |
| `diagnose` | Hard or flaky bugs — feedback loop |
| `automate-e2e-self-testing` | Set up or audit a Playwright **E2E self-testing loop** — accessibility-anchored specs + a `verify` gate (typecheck→lint→unit→e2e) + guardrails, so the agent verifies its own UI before human review |
| `react-typescript` | Deep React+TS typing playbook — discriminated-union state, generics, props/hooks/events, Zod boundary validation, strict tsconfig. Invoke when typing or reviewing a component/hook |
| `frontend-unit-testing` | Unit/component testing discipline (**Vitest** + Testing Library) — TDD, test doubles, mocking recipes, async/edge. *Opt-in: workspace default runner is Jest; the skill detects which runner is present. Templates are Vite-first — adapt for Next.* |
| `react-performance` | Profiling-first React runtime-perf playbook — React 19 Compiler/concurrent/RSC, re-renders, bundles, Core Web Vitals. Invoke on a slow path (deeper than the `performance-analyzer` agent) |
| `deploying-web-apps-aws` | Deploy to **AWS** — S3+CloudFront (static), Lambda/API Gateway/DynamoDB (serverless backend), Route 53/ACM, OIDC CI, least-privilege IAM, cost guards. *Alternative to the default Vercel target (see caveat below)* |
| `self-learning` | Study a course/book/mindset with active recall, teach-back & spaced review (`/self-learning <topic>`) |
| `frontend-craft` | **Auto-loads on any FE file** (.tsx/.jsx/.vue/.svelte/.astro/.razor/.html/.css) — framework-agnostic mindset: semantic HTML, CSS craft, accessibility, prompt framework |
| `nextjs-patterns` | **Auto-loads on .tsx/.jsx/next.config** — React/Next layer on `frontend-craft`: RSC/hydration, next/image, SWR, security |

**Deep-dive skills — how they relate to the always-on layers:**
- **Unit/component tests:** the `test-generator` agent writes individual specs · `/test-coverage`
  reports gaps · `frontend-unit-testing` (skill) teaches the discipline behind them. *Runner
  note:* the rules and `test-generator` standardize on **Jest**; the skill is **Vitest** and
  opt-in — use it only where a project adopts Vitest.
- **E2E:** `automate-e2e-self-testing` builds the Playwright harness — config, fixtures, the
  `verify` gate, guardrails, and CI. Run it once to stand up the self-testing loop.
- **Runtime performance:** the `performance-analyzer` agent triages a slow path fast;
  `react-performance` is the deep, profiling-first playbook it can escalate into.
- **Types:** `react-typescript` is the deep companion to the `naming-typescript` rule —
  reach for it on hard typing (generics, discriminated unions, polymorphic props, boundary validation).

> The three `react-*` / `frontend-unit-testing` skills ship **Vite-first templates**; this is a
> Next.js workspace, so adapt the config (`next.config`, `jsx: preserve`, `NEXT_PUBLIC_*`) when applying them.

> **Deploying to AWS?** `deploying-web-apps-aws` is an alternative to the default **Vercel** target
> (Tech Stack, above) and to **Firebase** (its Lambda/DynamoDB backend). Its S3+CloudFront path hosts a
> **static** build only (`output: 'export'`, or a Vite SPA) — an App Router app with Server Components /
> route handlers / SSR needs a server host (**OpenNext / SST / Amplify Hosting**), not plain S3. Reach
> for the skill when a project deploys to AWS for enterprise reasons; otherwise Vercel handles SSR/RSC out of the box.

---

## Manual Commands

Kept lean — everything else is handled by auto-delegating **agents** (review, tests,
performance, debugging, security) and **skills** (generation via `do-work`, planning via
`grill-me`/`prd-to-plan`). These are the pre-PR gate (run by `ship-feature`) plus setup:

| Command | When |
|---------|------|
| `/code-review` | Bugs + AI anti-patterns + a11y + perf on all changed files (pre-PR) |
| `/security-review` | Security review — auth, RBAC, payment, data access (pre-PR) |
| `/test-coverage` | Coverage gap report for changed frontend files (pre-PR) |
| `/pr-summary` | PR description from git diff (pre-PR) |
| `/onboard` | Understand a new codebase + populate Environment Facts (project setup) |

---

## Working Habits

- **Separate planning from implementation.** Use plan mode / `scratchpad` first, then implement.
- **AI is a turbo-charged junior dev; you are the senior reviewer.** Review the actual diff,
  not the summary. Override on security/maintainability/disabled-checks; accept boilerplate.
- **Context hygiene.** `/clear` between distinct tasks; `/compact` when a task runs long.
- **Living document.** Correct the same mistake twice → encode it once (this file or memory).
- **Constraints over wording.** Specify framework version, folder structure, a11y, perf, and
  the "Do not"s in the prompt.

## What I Still Own
- Product & UX decisions · Component/design-system architecture
- Security architecture sign-off (auth, RBAC, payments)
- Performance trade-offs requiring real production data
- Accessibility standards · Team and process decisions

## Project Context

> Fill this in per project (leave blank in the master template).

- Project: [name]
- Domain: [business domain]
- Specific conventions: [anything that differs from defaults above]

### Project Boundaries
**In-scope:**
- [feature / responsibility this project owns]

**Out-of-scope:**
- [things Claude must NOT add: no new backend, no auth provider swap, no CI/CD, etc.]

### Environment Facts
Auto-populated by `/onboard`.

| Tool / Service | Value |
|----------------|-------|
| Node.js | [version] |
| Package manager | [npm / pnpm / yarn] |
| Next.js | [version] |
| OS / Shell | [e.g. Windows 11 / PowerShell] |
| Backend / BaaS | [Firebase / REST API host / "none"] |
| Deploy target | [Vercel / other] |
