---
name: do-work
description: >
  Executes a unit of work end-to-end: plans the change, implements it,
  validates via build, type-check, and test (Next.js / React / TypeScript),
  then produces a structured Work Summary. Use when the user asks to implement
  a feature, fix a bug, refactor code, or do any concrete development task.
---

# Do Work

Execute a single, well-scoped unit of development work end-to-end.

## Process

### 1. Plan

**If a plan file already exists** (`plans/{feature}-plan.md` from `prd-to-plan`),
read it and use it. Skip replanning — proceed directly to Step 2.

Otherwise, produce a concise plan before writing any code:
- **Map** — which files own the current behavior, which helpers/services to reuse,
  which layers stay untouched, and the safest insertion point. Seeing files is not
  understanding the system — trace the flow before deciding where code belongs.
  (See `@.claude/rules/safe-modification.md`.)
- **Problem** — what is broken or missing and why it matters
- **Root cause** — the underlying technical reason (if a bug)
- **Approach** — what files/classes will change and how
- **Risks** — anything that could break or needs care

Ask the user to confirm the plan before proceeding.
If scope is ambiguous, ask one clarifying question.

**UI work with no mockup:** if this is UI and there is no mockup or agreed design yet, stop
and run `build-prototype` first (it asks which output: wireframe / local HTML-CSS / shared
artifact / in-app variants) to settle the look — then implement. Don't guess a layout in
production code. Build UI to the `frontend-craft` standard (semantic, accessible, responsive).

For non-trivial changes, prefer running the `scratchpad` skill first and reading
`scratchpad/{feature}-scratchpad.md` here instead of replanning.

### 2. Build & test commands

This is a Next.js / React / TypeScript project. Use the project's package manager —
detect it from the lockfile:

| Lockfile | Package manager | Build | Test |
|----------|-----------------|-------|------|
| `pnpm-lock.yaml` | pnpm | `pnpm build` | `pnpm test` |
| `yarn.lock` | yarn | `yarn build` | `yarn test` |
| `package-lock.json` (default) | npm | `npm run build` | `npm test` |

Also run `tsc --noEmit` for type-checking, and `npx playwright test` where an e2e flow
is relevant.

### 3. Implement

Make only the changes identified in the plan:
- Follow patterns from `@.claude/context/` (templates, architecture) and the `nextjs-patterns` skill
- Follow all rules in `@.claude/rules/`
- No comments unless the WHY is non-obvious
- No extra abstractions or features beyond what the plan specifies

### 4. Build feedback loop

Run the build command (plus `tsc --noEmit`). Fix compilation and type errors before
moving on. Repeat until build is clean — never silence errors with `@ts-ignore` or
`ignoreBuildErrors`.

### 5. Test feedback loop

Run the test command. Fix any failing tests. Repeat build → test loop until all pass.

If e2e tests are relevant, run `npx playwright test` for the affected flows.

### 6. Validate unchanged behavior

Before writing the summary, list the behaviors that must remain unchanged after this
change and explain how the implementation preserves each. Then self-audit the diff
for silent technical debt: duplicated logic, bypassed shared utilities, unnecessary
abstractions, or anywhere the code does more than the plan required. If the
preservation explanation is vague or the audit finds debt, fix it before summarizing.

### 7. Work Summary

End every do-work session with this structured summary:

---

## Work Summary

**Problem**
One sentence: what was wrong or missing.

**Root Cause**
The specific technical reason (wrong key, missing null check, incorrect logic, etc.).

**What Changed**
Bullet list of files changed and what was changed in each.

**How It Was Fixed**
Concise description of the fix and why it resolves the root cause.

**How to Improve Further** *(optional)*
Anything left out of scope, follow-up tickets worth raising, or architectural improvements.

**Test Results**
- Build: PASS / FAIL
- Unit tests: X passed, Y failed
- Integration tests: X passed, Y failed (or "not run")
