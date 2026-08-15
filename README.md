# Frontend Master Workspace

An AI-native development workspace for building **production-grade frontend** with Claude
Code. It turns AI from a fast-but-sloppy code generator into a disciplined pair - one that
already knows semantic HTML, accessibility, responsive CSS, your review gates, and your
"what should this look like?" workflow.

Ships configured for **Next.js / React / TypeScript**, but the craft layer is
framework-agnostic (see [Extending to other stacks](#extending-to-other-stacks)).

> **Who this is for:** a frontend developer who wants AI leverage without shipping
> tomorrow's tech debt. You stay the pilot; the workspace keeps the AI on the rails.

---

## At a glance (30-second model)

The workspace works on four layers. You mostly drive the top; the rest happens for you.

| Layer | What it is | How it fires |
|-------|------------|--------------|
| **Rules** | Always-on engineering standards | Loaded every session via `@` in `CLAUDE.md` |
| **Skills** | Reusable workflows & the FE craft playbook | Auto-load on file type, or you invoke `/skill` |
| **Agents** | Specialist reviewers/helpers | Auto-delegate on-demand (tests, perf, debugging, docs) |
| **Commands** | The pre-PR gate + project setup | You run `/command` explicitly |

Two ideas run through all of it:

- **UI is mockup-first.** Never write production UI from a fuzzy spec - settle the look with
  `build-prototype` first.
- **Craft is framework-agnostic.** Semantic HTML / CSS / a11y live in `frontend-craft` and
  apply to any stack; `nextjs-patterns` is a thin React/Next layer on top.

---

## How the workspace thinks

### You are the pilot - Override vs Accept

AI-generated UI is a turbo-charged junior developer: fast, idiomatic, and sloppy where it
matters. "Runs locally" is not "production-ready." The workspace encodes the senior's
judgment:

- **Override** when the output endangers **security** (hardcoded secrets, client-only auth),
  damages **maintainability** (everything in one file), or silences **checks**
  (`ignoreBuildErrors`, `@ts-ignore`).
- **Accept** functional boilerplate, style-matching scaffolding, and clearly-temporary mock
  data. Polish later.

### Two layers - craft vs framework

```
frontend-craft/        ← framework-agnostic MINDSET (auto-loads on any FE file)
  semantic HTML · CSS craft · accessibility · responsive · R‑G‑C‑S‑A‑O‑V prompt framework
      ▲ referenced by
nextjs-patterns/       ← thin React/Next layer (RSC · hydration · next/image · SWR · security)
```

The craft is written once. Switch to Vue/Angular/Blazor later and only the thin layer
changes - the semantic/accessible/responsive mindset carries over untouched.

### UI is mockup-first

A frontend task arrives one of two ways, and the mockup is central to both:

```
Task WITH a mockup      →  do-work            (implement it to the frontend-craft standard)
Task with only a SPEC   →  grill-me           (clarify behaviour & scope)
                        →  build-prototype     (settle the look - see the 4 output modes)
                        →  do-work             (implement)
```

For a frontend developer, seeing the interface is part of clarifying the requirement.

---

## Setup for a project

**Prerequisites:** Node.js, a package manager (npm/pnpm), VSCode with the Claude Code
extension, and a frontend repo to work in.

1. **Copy `.claude/` into your repo root.** (Copy `docs/` too for the build guide.)
   ```bash
   cp -r my-frontend-workspace/.claude your-app/
   ```
2. **Open the repo in VSCode.** `frontend-craft` and `nextjs-patterns` auto-load when you
   open `.tsx`/`.css`/etc.
3. **Fill in `CLAUDE.md` → Project Context.** Set the project name, domain, and - most
   important - **Project Boundaries** (`In-scope` / `Out-of-scope`). This is the single
   strongest guard against the AI over-building.
4. **Run `/onboard`.** It maps the codebase and auto-populates the **Environment Facts**
   table (Node version, package manager, Next version, deploy target).
5. **You're ready.** Start the pipeline (below) on your first real task.

---

## The daily workflow

### Pick your entry point

| You have… | Start with | Then |
|-----------|-----------|------|
| A vague idea / a UI feature, no mockup | `grill-me` | → `build-prototype` → `do-work` |
| A clear behaviour spec | `write-a-prd` | → `prd-to-plan` → `do-work` |
| A design/mockup to implement | `do-work` | - |
| A small, obvious change | `do-work` (no plan file) | - |
| Finished code, ready for PR | `ship-feature` | - |

### The full pipeline (features)

```
grill-me → write-a-prd → prd-to-plan → scratchpad (non-trivial only) → do-work → ship-feature
```

- **`grill-me`** - one question at a time, each with a recommended answer, until the design
  is unambiguous. For a UI feature with no mockup, it hands off to `build-prototype`.
- **`write-a-prd` / `prd-to-plan`** - turn the shared understanding into a spec, then a
  phased plan (`prd/…`, `plans/…`).
- **`scratchpad`** - persistent working memory for a non-trivial change (map, edge cases,
  risks, decisions). Survives `/clear` and interrupted sessions. Skip it for small tasks.
- **`do-work`** - implement → build → test → fix, loop until green. Ends with a Work Summary.
- **`ship-feature`** - the pre-PR gate: runs `/code-review` → `/security-review` →
  `/test-coverage` → `/pr-summary` and stops at Critical findings.

### Building UI: `build-prototype`

When the question is "what should this look like?", `build-prototype` **always asks which
output you want** - pick the lightest that answers the question:

| Mode | You get | Best when |
|------|---------|-----------|
| **Text / ASCII wireframe** | A sketch in the chat | Judging structure/hierarchy - no code needed |
| **Local HTML/CSS** | One self-contained `.html` file (double-click) | Feeling real typography, spacing, responsiveness |
| **Shared artifact** | A hosted, shareable preview (a Claude Artifact) | Sharing the mockup for review via a link |
| **In-app variants** | Variants inside the real app, `?variant=` switcher | Only real data/density can settle it |

Every mode follows the `frontend-craft` standard: a prototype skips tests and error-handling,
**never** semantics and accessibility.

---

## Getting the most out of it (senior tips)

- **Let the agents work - don't micro-manage.** After you write code, the specialist agents
  self-delegate: `debugger` on errors, `test-generator` for coverage, `performance-analyzer`
  on slow paths, `docs-explorer` for live library docs. You don't invoke them; you review
  their output.
- **Prompt UI generation with the scaffold.** For any "generate this UI" ask, use
  **R‑G‑C‑S‑A‑O‑V** (Role · Goal · Context · Specs · **Accessibility** · Output ·
  **Verification**) from `frontend-craft/PROMPT-FRAMEWORK.md`. The A and V force a11y and a
  self-review into the output instead of leaving them to chance.
- **Chain prompts, don't one-shot.** Semantics first, styling second: Scaffold → Style →
  Interact. Asking for everything at once causes omissions.
- **Trust the pre-PR gate.** Run `ship-feature` before every PR. It's a deterministic,
  ordered batch - distinct from the agents that fire continuously while you code.
- **Keep context clean.** `/clear` between distinct tasks; `/compact` when one task runs
  long. If answers start drifting, that's usually stale context, not a bad prompt.
- **Fill Project Boundaries honestly.** Out-of-scope is what stops the AI from solving a
  bigger problem than you have.
- **Correct once, encode once.** If you fix the same thing twice, put it in a rule or in
  `CLAUDE.md` so you never repeat it.

---

## Reference

### Skills (10)

| Skill | Use it to… |
|-------|-----------|
| `grill-me` | Sharpen a vague idea into a shared understanding (one question at a time) |
| `write-a-prd` | Turn understanding into a structured PRD |
| `prd-to-plan` | Turn a PRD into a phased implementation plan |
| `scratchpad` | Hold working memory for a non-trivial change; recover an interrupted session |
| `do-work` | Implement a change end-to-end (build/test loop + Work Summary) |
| `ship-feature` | Run the full pre-PR gate in one command |
| `build-prototype` | Settle "what should this look like" - 4 output modes |
| `diagnose` | Work a hard or flaky bug through a structured loop |
| `frontend-craft` | *(auto)* Framework-agnostic craft: semantic HTML, CSS, a11y, prompt framework |
| `nextjs-patterns` | *(auto)* React/Next specifics: RSC, hydration, next/image, SWR, security |

### Agents (4) - auto-delegate

`test-generator` · `debugger` · `performance-analyzer` · `docs-explorer`.
Code review and security review run as **commands** (below), not continuous agents.

### Commands (5)

| Command | When |
|---------|------|
| `/code-review` | Bugs + AI anti-patterns + a11y + performance on changed files (pre-PR) |
| `/security-review` | Auth, RBAC, payment, data-access review (pre-PR) |
| `/test-coverage` | Coverage-gap report for changed files (pre-PR) |
| `/pr-summary` | PR description from the git diff (pre-PR) |
| `/onboard` | Map a new codebase + populate Environment Facts (project setup) |

The first four are the `ship-feature` gate.

### Rules - always on

Core (stack-agnostic): `structure` · `design-principles` · `comments` · `safe-modification`.
Frontend: `naming-typescript` · `methods-and-components` · `async-nextjs` ·
`error-handling-nextjs` · `testing-nextjs` · `checklist`.

### Also inside

- `context/` - `architecture-nextjs` · `templates-nextjs` · `testing-nextjs` (reference material).
- `docs/HOW-TO-BUILD-A-PROJECT.md` - a language-agnostic zero-to-production build guide.
- `settings.json` - npm/node permissions, a Stop-hook reminder, and a deny-list for
  process-killing commands.

---

## Extending to other stacks

The workspace is designed so a new frontend stack is a **thin layer**, not a rebuild:

1. Keep `frontend-craft` - the semantic/CSS/a11y/prompt mindset is universal.
2. Add a `{stack}-patterns` skill (auto-loads on that stack's file types) that references
   `frontend-craft` and adds only the framework specifics - the way `nextjs-patterns` does.
3. Add stack-specific rules/context (`naming-*`, `error-handling-*`, `testing-*`) alongside
   the existing ones; leave the shared core untouched.

Everything else - the pipeline, the agents, the pre-PR gate, `build-prototype` - is already
stack-agnostic.

---

## Setup checklist

```
□ .claude/ copied to the repo root
□ Repo opened in VSCode with the Claude Code extension
□ CLAUDE.md Project Context filled in
□ CLAUDE.md Project Boundaries filled in (in-scope / out-of-scope)
□ /onboard run - codebase mapped, Environment Facts populated
□ First task run through the pipeline (grill-me → … → ship-feature)
```
