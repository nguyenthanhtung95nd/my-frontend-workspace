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

## The Rule of Least Power

Use the least powerful tool that gets the job done: **semantic HTML -> CSS -> JS, in
that order**. HTML and CSS are declarative — the browser optimizes them for you; JS is
imperative — its complexity, bugs, and CPU cost are yours. Modals, accordions,
carousels, theming, validation UX, tooltips, scroll effects: the platform now covers
all of these (see CSS-FIRST-PATTERNS). Before writing any script, ask: can semantics +
CSS handle it? Can a native element get 80% there? If JS still enters, keep it small,
resilient, and behind a graceful fallback. In component frameworks this often deletes
a client boundary entirely — no event handler means no `"use client"`.

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
- **[CSS-FIRST-PATTERNS.md](CSS-FIRST-PATTERNS.md)** — the Rule of Least Power in
  practice: a decision table of UI patterns the platform already covers (dialog,
  details, popover, :has(), masks, scroll-driven animation, anchor positioning,
  view transitions, :user-invalid...), plus the progressive-enhancement discipline
  (@supports gating, reduced-motion, typed @property, a11y bridges). Read BEFORE
  reaching for JS or a library for any interactive UI pattern.
- **[MODERN-CSS-UX.md](MODERN-CSS-UX.md)** — modern CSS features that fix real UX
  problems, organized by problem: layout stability (aspect-ratio, scrollbar-gutter,
  dvh/svh, safe-area), state-aware CSS (:has() perf, focus-visible discipline,
  accent-color), container queries + subgrid, typography (text-wrap, ch, clamp,
  line-clamp), adaptive color (color-scheme, light-dark, color-mix), overlays
  (inert, overscroll-behavior), motion, OS preference queries, @layer,
  content-visibility — ends with the review checklist AI output usually fails.
  Read when styling any surface and when reviewing generated CSS.
- **[FORM-UX.md](FORM-UX.md)** — form design craft: proximity + Jakob's law,
  top-aligned labels (placeholders are not labels), one completion path,
  required-vs-optional, progressive disclosure, eager validation + human error
  copy, reduce interaction cost (prefill, masks, correct input types, radios over
  small dropdowns), autosave/optimistic UI/loader-delay feedback, password and
  date-of-birth specifics. Read before building or reviewing ANY form.
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — WCAG discipline, keyboard, ARIA rules, and the
  tooling (axe-core, Lighthouse CI, Playwright visual). Read on anything user-facing.

These principles hold whether you write JSX + Tailwind today or Vue/Blazor/vanilla CSS
tomorrow. The stack changes; the craft does not.
