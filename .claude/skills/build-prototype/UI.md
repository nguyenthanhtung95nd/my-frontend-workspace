# UI Prototype

Explore **what something should look like**. For a frontend developer the mockup is
central — never write production UI from a fuzzy spec without seeing the interface first.

If the question is about logic/state rather than appearance — wrong branch. Use
[LOGIC.md](LOGIC.md).

**All prototype output follows the craft standard.** Whatever mode you pick below, the
markup is semantic and accessible and the layout is responsive — per the `frontend-craft`
skill (SEMANTIC-HTML, CSS-CRAFT, ACCESSIBILITY). A prototype is throwaway on *tests and
error-handling*, not on semantics and a11y.

## When this is the right shape

- "What should this page look like?" · "Show me a few options before I commit."
- "Try a different layout for the settings screen."
- A task that arrives as a **behaviour spec with no mockup** — build the mockup here first,
  then implement.

## Pick an output mode — ALWAYS ASK

Before building anything, **ask the user which output they want** (if unreachable, infer and
state the choice in one line). Four modes, lightest first:

| Mode | What you produce | Best when |
|------|------------------|-----------|
| **1. Text / ASCII wireframe** | A sketch in the chat, nothing to run | Question is about *structure / hierarchy / primary affordance* — judgeable from a drawing |
| **2. Local HTML/CSS** | One self-contained `.html` file (embedded CSS), double-click to view; framework-agnostic; can hold multiple variants | You want to *feel* real typography, spacing, and responsiveness without wiring a framework |
| **3. Shared artifact** | A hosted, shareable preview (a **Claude Artifact** today; other agentic tools have their own equivalent) | You want to *share the mockup* for review (stakeholder, teammate) via a link |
| **4. In-app variants** | Variants rendered inside the real app, switchable (React `?variant=`, or the framework's equivalent) | Only *real data, real density, real app chrome* can settle it |

Default: start at the **lowest mode that can answer the question**; escalate only when it
can't. Don't build a running project when a wireframe would do — and don't ship a wireframe
when the real question is "how does this feel with live data?"

---

## Mode 1 — Text / ASCII wireframe

Convey layout and hierarchy fast, nothing to run.

1. State the question in one line; pick **N** (default 3, cap 5).
2. Sketch each idea as a labelled ASCII wireframe — regions (header, nav, content, primary
   action) annotated with what each holds and *why*, in domain language. Ideas must disagree
   about **structure**, not spacing ("no wallpaper").

   ```
   Variant A — actions in a top bar
   ┌───────────────────────────────────────────┐
   │ Logo        Search…            [+ New]  ⚙  │  ← global actions top-right
   ├───────────┬───────────────────────────────┤
   │ Nav        │  Page title                   │
   │  • Orders  │  ┌─────────┐ ┌─────────┐       │  ← primary content = card grid
   │  • Reports │  └─────────┘ └─────────┘       │
   └───────────┴───────────────────────────────┘
   ```

3. Deliver inline so the user can react and hand-edit. Feedback is usually *"A's top bar with
   B's sidebar"* — that's the design they want.

## Mode 2 — Local HTML/CSS

One self-contained `.html` file with embedded `<style>` — no framework, no bundler, no
server; opens by double-click and survives being emailed. **This is the framework-agnostic
high-fidelity mode.**

- Semantic HTML + accessible + responsive per `frontend-craft`. Use design tokens
  (CSS custom properties) so the palette is one change.
- For multiple variants, put each in its own `<section>` and add a tiny toggle (radio
  buttons or a small script) — or ship one file per variant. Keep the "no wallpaper" rule.
- Name it obviously throwaway (e.g. `prototype-pricing.html`). Deliver the file (or open it).
- When a variant wins, fold the *chosen structure + tokens* into the real component; the
  HTML file rides to the throwaway branch as the primary source.

## Mode 3 — Shared artifact

A hosted, shareable preview for review. Today this is a **Claude Artifact** (a private page
you can choose to share); the concept is tool-agnostic — other agentic tools (Cursor, Codex,
Copilot, …) expose their own equivalent hosted-preview, so describe it that way and use
whichever the current environment provides.

- Same craft standard as Mode 2 (self-contained, semantic, accessible, responsive).
- Best when the point is **sharing the mockup for feedback**, not running it locally.
- Do not put real secrets, real customer data, or anything impersonating a real
  brand/person into a shared artifact — it may be distributed.
- The artifact is the primary source; capture its URL on the implementation issue.

## Mode 4 — In-app variants

Variants rendered inside the real app so they butt up against real header/sidebar/data/
density — the most decisive, most expensive mode. Framework-agnostic in principle (the
switcher is React `?variant=`, or the equivalent router mechanism in Vue/Svelte/Angular/
Blazor).

**Prefer sub-shape A (embed in an existing page)** over B (a throwaway route): a route on
its own is a vacuum where every variant looks fine. Only use B when there's genuinely no
host page.

- **Sub-shape A** — render variants on the existing route, gated by a `?variant=` param;
  existing data/params/auth stay, only the rendered subtree swaps.
- **Sub-shape B** — a throwaway route following the project's routing convention, named
  obviously as a prototype (`/prototype/<name>`), same `?variant=` pattern.

Process: state the question + pick N (3, cap 5) → generate **structurally different**
variants (different layout/hierarchy/primary affordance, not colour) → wire a switcher →
add a floating switch bar → hand over the URL → capture the winner.

```tsx
// pseudo-code — adapt to the project's framework/router
const variant = searchParams.get('variant') ?? 'A';
return (<>
  {variant === 'A' && <VariantA {...data} />}
  {variant === 'B' && <VariantB {...data} />}
  <PrototypeSwitcher variants={['A','B','C']} current={variant} />
</>);
```

Floating switch bar: prev/next arrows + current label; updates the URL param (shareable,
reload-stable); `←`/`→` keys cycle (not while an input/textarea/contenteditable is focused);
visually distinct; **hidden in production** (`process.env.NODE_ENV !== 'production'` or
equivalent) so a stray merge can't ship it. When a variant wins, fold it into the real code;
the full set rides the throwaway branch, not `master`.

---

## Anti-patterns (all modes)

- **Variants that differ only in colour or copy** — a tweak, not a prototype. Real variants
  disagree about structure.
- **Skipping the craft** — a prototype is exempt from tests and error-handling, **not** from
  semantic HTML and accessibility. `<div onClick>` and unlabelled inputs are never okay.
- **Sharing too much between variants** — a shared `<Header>` is fine; a shared `<Layout>`
  defeats the point.
- **Wiring variants to real mutations** — keep it read-only; point at a stub.
- **Promoting the prototype straight to production** — it was written under prototype
  constraints; rewrite it properly (tests, error handling) when you fold it in.
