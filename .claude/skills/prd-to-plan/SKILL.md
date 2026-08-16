---
name: prd-to-plan
description: >
  Converts a PRD into a phased implementation plan using vertical-slice tracer
  bullets. Each phase cuts end-to-end through all integration layers rather than
  one horizontal layer. Identifies durable architectural decisions upfront and
  maps user stories to phases with acceptance criteria. Use when the user has a
  PRD and wants to turn it into an actionable plan, or after using write-a-prd.
---

# PRD to Plan

Break a PRD into a phased implementation plan using vertical slices (tracer bullets).
Output saved to `plans/{feature}-plan.md`.

## Process

### 1. Confirm the PRD is in context
The PRD should already be in the conversation or referenced as a file.
If not, ask the user to paste it or point to the file path.

### 2. Explore the codebase
If not already done, read relevant files to understand the current architecture,
existing patterns, and integration layers before slicing.

### 3. Identify durable architectural decisions
Before defining phases, extract high-level decisions that will remain stable
throughout implementation. These anchor every phase:
- Route structure / URL patterns (App Router) and the Server/Client boundary
- Data model / Firestore collections shape
- Key TypeScript types shared across layers
- Authentication / authorization approach (where each check is enforced)
- Third-party service boundaries (Firebase, Stripe) wrapped in `/lib`

### 4. Draft vertical slices
Break the PRD into tracer bullet phases. Each phase must be a **thin vertical
slice** that cuts through **all integration layers end-to-end** — schema, API,
business logic, and tests — not a horizontal layer.

### 5. Review with the user
Present the proposed breakdown. For each phase show:
- **Title** — short descriptive name
- **User stories covered** — which stories from the PRD this addresses

Ask: Does the granularity feel right? Should any phases be merged or split?
Iterate until the user approves.

### 6. Write the plan file
Always render the completed plan as a markdown block in the chat.

If file tools are available, also save locally:
```
plans/{kebab-case-feature-name}-plan.md
```

---

## Plan Template

```markdown
# Implementation Plan: {Feature Name}

> Source PRD: [prd/{feature}-prd.md](../prd/{feature}-prd.md)

## Architectural Decisions

Durable decisions that apply across all phases:
- **Stack:** Next.js (App Router) / React / TypeScript
- **Routes / Boundary:** ...
- **Data model:** ...
- **Key types:** ...
- **Auth:** ...

---

## Phase 1 — {Title}

**User stories:** {list story numbers from PRD}

### What to build
{Concise description of this vertical slice — end-to-end behavior, not layer-by-layer tasks.}

### Acceptance criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] Loading / empty / error states implemented
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`

---

## Phase 2 — {Title}

**User stories:** {list story numbers from PRD}

### What to build
...

### Acceptance criteria
- [ ] ...
```
