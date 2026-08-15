# Prompt Framework for UI Generation

How to prompt an AI (or structure your own thinking) to generate UI that arrives already
shaped to production standards. Framework-agnostic — works for JSX, Vue, Blazor, or plain
HTML/CSS.

## The R‑G‑C‑S‑A‑O‑V scaffold

A 7-part structure for any "generate this UI" request. Keep the order; drop parts that
don't apply.

| Part | What it pins down |
|------|-------------------|
| **Role** | The persona ("senior frontend engineer") |
| **Goal** | What success looks like, in one line |
| **Context** | Stack, existing design language, audience, assets, prior work |
| **Specs** | Exact requirements + acceptance criteria (breakpoints, layout system, sizes) |
| **Accessibility** | Non-negotiables: semantic elements, WCAG AA, keyboard, focus, reduced-motion |
| **Output** | File format, structure, naming, length; "no external libs" if that matters |
| **Verification** | Self-check rubric: what to confirm (responsive at Xpx, keyboard-reachable) |

> **A** and **V** are what separate a demo from production. Always include them — they force
> accessibility and a self-review into the output, not as an afterthought.

Example skeleton:
```
ROLE: senior frontend engineer.
GOAL: responsive, accessible pricing section.
CONTEXT: dark-slate palette, system-ui font, B2B audience, placeholder copy.
SPECS: 3 cards desktop / 2 tablet(≤900) / 1 mobile(≤600); Grid; max-width 1100px.
ACCESSIBILITY: semantic <section>/<article>/<h3>/<ul>/<button>; WCAG AA; 44px targets;
               visible focus; respect prefers-reduced-motion.
OUTPUT: self-contained; no external libs.
VERIFICATION: confirm columns change at 900/600 via CSS only; all interactive elements
              keyboard-reachable with visible focus; explain Grid-vs-Flex in 3 bullets.
```

## Prompt chaining — one goal per stage

Asking for semantics + layout + responsiveness + interaction + a11y all at once causes
omissions. Chain the stages, the way developers actually work:

- **Scaffold → Style → Interact** — (1) semantic HTML skeleton, *no CSS*; (2) layout CSS;
  (3) design tokens/theming; (4) interactions (hover/focus/responsive); (5) review + note
  limitations. This is "semantics first, styling second" as a prompt sequence.
- **Generate → Critique → Refine** — generate, then make the model critique its own output
  for a11y/performance, then fix while keeping the design. Turns the AI into author *and*
  reviewer.
- **Explain → Generate** — ask it to explain its approach first, so the solution is
  intentional, not arbitrary.
- **Branching** — generate a few variations in parallel, then merge the best. (This is what
  `build-prototype`'s variant modes do.)

## Few-shot for consistent code style

To stop the AI drifting between `.btn-primary` / `.cta` / `.button`, or Flexbox in one
place and Grid in another: give 1–3 short input→output examples that anchor your naming,
your ARIA usage, and your formatting. Keep examples tiny (one button, one field). The model
mimics naming and formatting habits — use that.

## Clarity · Context · Constraints

Every weak prompt fails on one of these: it's vague ("make a webpage"), context-free ("add
a nav bar" — where? what links? what layout?), or unconstrained ("a landing page" — any
outcome). State the content, the placement/role, and the limits. Vague in, vague out.
