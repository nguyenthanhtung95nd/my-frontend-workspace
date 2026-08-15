---
name: build-prototype
description: Build a throwaway prototype to answer a design question. Use when a UI task has no mockup, when exploring what a UI should look like, or to sanity-check whether a state model feels right. Central to frontend work — invoked directly and from grill-me (clarifying a UI feature) and do-work (implementing UI without a mockup).
---

# Build Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

For frontend work this skill is central: **the UI mockup is how you settle "what should
this look like" before writing production code.** It is reached three ways — directly, from
`grill-me` (when clarifying a UI feature that has no mockup), and from `do-work` (when a UI
task arrives as a behaviour spec with no mockup). Build the mockup here, then implement.

> **Prototype code is exempt from the workspace's always-on `@.claude/rules/` and from
> `/code-review`.** Those rules (full test coverage, error handling, naming, folder
> hygiene) target production code; holding a throwaway prototype — often a quick sketch or
> multi-variant page — to them defeats the point. Do not run review on prototype files.
> Mark the code clearly as a prototype (Rule 1) so it is never mistaken for production.

## Pick a branch

Identify which question is being answered — from the user's prompt, the surrounding code, or by asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a single shareable HTML file — free-play buttons plus tabbed guided walkthroughs — that pushes the state machine through cases that are hard to reason about on paper, and that a non-developer can drive.
- **"What should this look like?"** → [UI.md](UI.md). **Always ask which output mode** the user wants: (1) text/ASCII wireframe, (2) local self-contained HTML/CSS file, (3) shared artifact (hosted preview — a Claude Artifact, or the current tool's equivalent), or (4) in-app variants (`?variant=` switcher). All modes follow the `frontend-craft` standard (semantic, accessible, responsive) — a prototype skips tests and error-handling, never semantics and a11y.

The two branches produce very different artifacts — getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user isn't reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption at the top of the prototype.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Locate the prototype code close to where it will actually be used (next to the module or page it's prototyping for) so context is obvious — but name it so a casual reader can see it's a prototype, not production. For throwaway UI routes, obey whatever routing convention the project already uses; don't invent a new top-level structure.
2. **Trivial to run.** Match effort to the mode: a wireframe is inline; a local HTML/CSS file (or a logic demo) opens by double-click; a shared artifact opens by link; in-app variants start from the project's task runner (`pnpm <name>` / `npm run <name>` / etc). No thinking required to start it.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is _checking_, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE — wipe me" name.
4. **Skip the polish — but not the craft.** No tests, no error handling beyond what makes the prototype _runnable_, no abstractions. But for UI, semantic HTML and accessibility are **not** polish — they're part of the answer (per `frontend-craft`). A prototype with `<div onClick>` and unlabelled inputs answers the wrong question.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Capture it when done.** Fold any validated decision into the real code, then capture the prototype itself as a **primary source**: commit it to a throwaway branch, off `master` (this repo's default branch), and leave a context pointer to that branch on the implementation issue/ticket (e.g. Jira). Capture the answer too — the verdict and the question it settled — in the issue or a commit. `master` keeps only the validated decision.
