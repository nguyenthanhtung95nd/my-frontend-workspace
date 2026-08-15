# How to Build a Frontend Project - Zero to Production

A hands-on walkthrough for taking a **new frontend app** from an empty folder to a
shipped, production-ready release using this workspace. The running example is a small
**Task Board** (columns *To do / Doing / Done*, task cards, add-a-task) - enough UI to
exercise semantics, accessibility, responsive layout, and data.

**The workspace is mockup-first.** You never write production UI from a fuzzy spec - you
settle *what it should look like* with `build-prototype` before you build it. That single
habit is what this guide is organized around.

Configured for **Next.js / React / TypeScript**; the craft carries to any frontend stack
(see [Extending to other stacks](../README.md#extending-to-other-stacks)).

---

## Principles that carry the whole build

Internalize these; the phases below just apply them.

1. **Plan before you code.** Use Plan Mode (read-only, `Shift+Tab`) so the agent reasons
   before it writes. → [`grill-me`](../.claude/skills/grill-me/SKILL.md)
2. **See it before you build it.** For any non-trivial UI, settle the look with a mockup
   first. → [`build-prototype`](../.claude/skills/build-prototype/SKILL.md)
3. **Constraints beat volume.** State what must change, what must not, and **what NOT to
   build yet**. → Project Boundaries + [`safe-modification`](../.claude/rules/safe-modification.md)
4. **Craft is not optional.** A prototype skips tests and error-handling - never semantic
   HTML and accessibility. → the `frontend-craft` skill (auto-loads on FE files)
5. **Iterate, don't one-shot.** Scaffold → Style → Interact; generate → run → **test** →
   refine. Early errors are normal.
6. **Wrap the data layer.** Talk to APIs through a typed client / SWR hook, not `fetch`
   scattered through components. → [`design-principles`](../.claude/rules/design-principles.md)
7. **You stay the pilot.** You own product, architecture, and taste. The agent accelerates;
   it does not decide - override on security / maintainability / disabled-checks.

---

## Prerequisites

- **Node.js** (LTS) + a package manager (`npm` / `pnpm`), verified: `node -v`.
- **VSCode** with the Claude Code extension.
- A GitHub account (for shipping).

---

## Phase 0 - Environment ready

Confirm the runtime, then know your permission modes - they set the rhythm of a session.

- `node -v` returns a version; Claude Code launches from inside the project folder.
- **default** asks before edits · **acceptEdits** auto-approves edits once you trust the
  direction · **plan** is read-only (use it for the planning phases). Cycle with `Shift+Tab`.

## Phase 1 - Scaffold the app

Get to a running baseline before adding anything. Keep the first pass narrow.

```bash
npx create-next-app@latest task-board --typescript --tailwind --eslint --app
cd task-board
npm run dev        # confirm it runs at http://localhost:3000
```

A narrower start yields a more stable scaffold. Don't add auth, a database, or state
libraries yet - you don't need them to render a board.

## Phase 2 - Point the workspace at the project

1. Copy the workspace into the new repo (see [Setup for a project](../README.md#setup-for-a-project)):
   ```bash
   cp -r /path/to/my-frontend-workspace/.claude ./
   ```
2. Open the folder in VSCode - `frontend-craft` and `nextjs-patterns` auto-load on `.tsx`.
3. Fill in `CLAUDE.md` → **Project Context** and especially **Project Boundaries**
   (`In-scope` / `Out-of-scope`). This is the strongest guard against over-building.
4. Run `/onboard` to populate **Environment Facts** (Node, package manager, Next version,
   deploy target).

## Phase 3 - Plan the first feature

Enter Plan Mode and run [`grill-me`](../.claude/skills/grill-me/SKILL.md). Resolve, one
question at a time: the actors, the core entities, the flow - **and lock what v1 will NOT
do**.

> **Task Board v1 out-of-scope:** no accounts/auth, no real backend (tasks live in local
> state / a mock API), no drag-and-drop reordering, no due dates. Just: view three columns,
> add a task, move a task between columns.

When behaviour is clear but the *look* isn't, don't pin down layout in words - go to the
next phase.

## Phase 4 - Settle the look (mockup-first)

Run [`build-prototype`](../.claude/skills/build-prototype/SKILL.md). It **asks which output
mode** - pick the lightest that answers the question:

| Mode | Use it when |
|------|-------------|
| Text / ASCII wireframe | Deciding the board's structure and hierarchy - no code needed |
| Local HTML/CSS | Feeling real spacing, typography, and how columns wrap on mobile |
| Shared artifact | Sharing the board mockup for feedback via a link |
| In-app variants | Comparing layouts against real data/density inside the app |

For the Task Board, a **local HTML/CSS** mockup of the three columns and a card is usually
the sweet spot: semantic (`<section>` per column, `<ul>`/`<li>` of `<article>` cards, a real
`<form>` to add), accessible, and responsive - all per `frontend-craft`. Settle the winning
layout here; it becomes the blueprint for the components.

## Phase 5 - Slice into buildable phases

[`prd-to-plan`](../.claude/skills/prd-to-plan/SKILL.md) turns the agreed design into
`plans/{feature}-plan.md` - **vertical slices** that each cut end-to-end (markup + state +
test), not horizontal layers. A sensible slicing for the board:

1. Static board from mock data (columns + cards render).
2. Add-a-task form (semantic form, validation, optimistic add).
3. Move a task between columns (keyboard-accessible).
4. Wire to a data source (mock API via SWR) with loading / empty / error states.

For a non-trivial build, run [`scratchpad`](../.claude/skills/scratchpad/SKILL.md) first to
map edge cases and risks; it survives `/clear` and interrupted sessions.

## Phase 6 - Build the UI, phase by phase

Drive each slice through [`do-work`](../.claude/skills/do-work/SKILL.md):

```
map → implement (this slice only) → npm run build / tsc --noEmit → npm test → fix → repeat
```

Build every component to the `frontend-craft` standard, and let the workspace enforce it:

- **Semantic + accessible markup** - real `<section>`/`<ul>`/`<article>`/`<button>`/`<form>`
  with labels; keyboard-operable; a11y is part of the build, not a later pass.
- **Data contract** - client data through an SWR hook with standardized
  `isLoading / error / data`; render **loading, empty, and error** states, not just the
  happy path.
- **Server vs client** - keep components server-rendered by default; add `"use client"`
  only where interaction needs it, as low in the tree as possible.

When a bug is hard or flaky, escalate to [`diagnose`](../.claude/skills/diagnose/SKILL.md).
Don't let the agent implement several slices in one unreviewed pass.

## Phase 7 - Handle regressions & polish

Real product rhythm: a new slice exposes a weakness elsewhere - the columns break when a
card's text grows, or the layout shifts on mobile. When you touch existing code, apply
[`safe-modification`](../.claude/rules/safe-modification.md): map first, keep the change
localized, and **list the behaviours that must stay unchanged** and how you preserved them.
Watch layout shift (CLS) and add `next/image` for any real images.

## Phase 8 - Harden & ship to production

Before every PR, run the pre-PR gate:

- [`ship-feature`](../.claude/skills/ship-feature/SKILL.md) → `/code-review` →
  `/security-review` → `/test-coverage` → `/pr-summary`. Stops at Critical findings.
- **Accessibility**: run axe (`@axe-core/playwright`) and fix violations; keyboard-test the
  add and move flows.
- **Performance**: Lighthouse CI against Core Web Vitals (LCP / CLS / INP); the
  `performance-analyzer` agent on any slow interaction.
- **Security**: no secrets in client code; if you later add a backend, auth/RBAC is enforced
  server-side, never client-only.
- **Ship**: push to GitHub, deploy (e.g. Vercel), then watch the first 30 minutes; treat an
  error-rate spike as an incident - triage before debugging.

---

## Verify - what "done" looks like

- The board renders three columns from data, with working loading / empty / error states.
- Add-a-task and move-a-task work by **keyboard** as well as mouse; every control is labelled.
- `npm run build` is clean (no `ignoreBuildErrors`/`@ts-ignore`); axe reports no violations;
  Lighthouse a11y and performance meet your budget.
- `ship-feature` passes with no open Critical findings.

## What you learned

The frontend loop is: **plan → see it (mockup) → slice → build to the craft → harden →
ship.** The mockup settles the look before code; `frontend-craft` keeps every slice
semantic and accessible; `nextjs-patterns` handles the React/Next specifics; and the pre-PR
gate makes "production-ready" a checklist, not a hope. Swap Next for another stack later and
only the thin framework layer changes - this flow stays the same.
