---
name: grill-me
description: >
  Pre-processing step that sharpens a vague idea into a shared understanding
  before writing a PRD. Interviews the user relentlessly one question at a time,
  provides a recommended answer for each question, and explores the codebase
  instead of asking when the answer is already there. Use when the user has a
  vague idea they want to harden, wants to stress-test a design, or mentions
  "grill me". Sits before write-a-prd in the pipeline:
  grill-me → write-a-prd → prd-to-plan → do-work.
---

# Grill Me

Interview the user relentlessly about every aspect of their plan or design
until reaching a shared understanding. Walk down each branch of the decision
tree, resolving dependencies between decisions one at a time.

## Rules

- Ask **one question at a time** — never batch multiple questions together.
- For each question, **provide your own recommended answer** before the user
  responds. This forces a concrete position and makes the conversation productive.
- If a question can be answered by **exploring the codebase**, do that instead
  of asking. Read relevant files first.
- Do not move to the next branch until the current decision is resolved.
- Continue until all branches are exhausted and there are no open questions.
- **For a UI feature with no mockup:** once behaviour and scope are clear but the *look* is
  still unsettled, don't try to pin down layout in words — offer to run `build-prototype`
  (it asks which output: wireframe / local HTML-CSS / shared artifact / in-app variants) to
  settle "what should this look like" before the PRD. For a frontend developer, seeing the
  interface is part of clarifying the requirement.

## Example Conversation

> **You:** I want to add a product search that filters as the user types.
>
> **Claude:** First question — where should the filtering happen?
> My recommendation: on the **server** via a route handler / server action, since the
> catalogue is large and you already fetch products server-side. The client just sends the
> query. Or do you want purely client-side filtering because the full list is already loaded?
>
> **You:** Server-side — the catalogue is thousands of items.
>
> **Claude:** Next — how do we avoid a request on every keystroke?
> My recommendation: **debounce** the input (~300ms) and fetch with **SWR** keyed on the
> query, cancelling superseded requests via `AbortController` (per `async-nextjs.md`). That
> gives us `isLoading`/`error`/`data` for free. Agree, or do you prefer React Query?
>
> **You:** SWR is fine.
>
> **Claude:** Then — what should the UI show for each state? My recommendation: a skeleton
> while loading, an explicit "No results for '<query>'" empty state, and an error state with
> retry — never a blank list. Sound right?

When all branches are resolved, offer to run `build-prototype` if the look is still
unsettled, then `/write-a-prd`.
