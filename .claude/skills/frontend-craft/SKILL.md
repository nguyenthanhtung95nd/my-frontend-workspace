---
name: frontend-craft
description: >
  Framework-agnostic frontend engineering mindset — semantic HTML, CSS craft,
  accessibility, responsive design, and the AI prompt framework for generating UI.
  The universal base for ANY frontend stack (React/Next, Vue, Svelte, Angular, Blazor,
  or hand-written HTML/CSS). Auto-loads on any frontend file (.tsx/.jsx/.vue/.svelte/
  .astro/.razor/.html/.css). Framework-specific skills (e.g. nextjs-patterns) build on top.
context: auto
---

# Frontend Craft — the framework-agnostic mindset

HTML/CSS/accessibility is the foundation every frontend developer stands on, regardless
of framework. This skill holds that craft. Framework-specific skills (`nextjs-patterns`,
and any future `vue-patterns`/`angular-patterns`/`blazor-patterns`) are thin layers that
express this same craft in their stack — they reference here, they don't repeat it.

## The one mental model

**AI-generated UI is a turbo-charged junior developer: fast, idiomatic, sloppy where it
matters.** It gives you a sketch; you turn it into architecture. "Runs locally" ≠
"production-ready". You review, harden, and own it.

## Override vs Accept (universal)

**Override** when AI output endangers **security** (hardcoded secrets, client-only auth),
damages **maintainability** (everything in one file, no structure), or silences **checks**
(disabled linters/types). **Accept** functional boilerplate, style-matching scaffolding,
and clearly-temporary mock data. Polish later.

## Semantics first, styling second

Build the meaning before the look: correct semantic structure → layout → interaction.
This is also how to prompt for it (see PROMPT-FRAMEWORK: Scaffold → Style → Interact).

## Two ways a UI task arrives

Frontend work starts one of two ways — and the UI mockup is central to both:

1. **A mockup already exists** → implement it faithfully, applying the craft below.
2. **Only a behaviour spec** → clarify it with `grill-me`, then explore the look with
   `build-prototype` (which always asks how to build it: text wireframe, local HTML/CSS,
   shared artifact, or in-app variants), then implement with `do-work`.

Never write production UI from a fuzzy spec without settling what it should look like
first. For a frontend developer, seeing the interface is not optional.

## The craft (read the reference for the task at hand)

- **[PROMPT-FRAMEWORK.md](PROMPT-FRAMEWORK.md)** — the R‑G‑C‑S‑A‑O‑V prompt scaffold,
  prompt chaining (Scaffold→Style→Interact, Generate→Critique→Refine, Explain→Generate),
  and few-shot for consistent code style. Read when generating UI from a spec.
- **[SEMANTIC-HTML.md](SEMANTIC-HTML.md)** — landmarks, heading hierarchy, accessible
  forms, tables, buttons-vs-links. Read when structuring markup (any framework's templates).
- **[CSS-CRAFT.md](CSS-CRAFT.md)** — Flexbox/Grid, mobile-first responsive, design tokens,
  focus-visible, reduced-motion, fluid type. Read when styling.
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — WCAG discipline, keyboard, ARIA rules, and the
  tooling (axe-core, Lighthouse CI, Playwright visual). Read on anything user-facing.

These principles hold whether you write JSX + Tailwind today or Vue/Blazor/vanilla CSS
tomorrow. The stack changes; the craft does not.
