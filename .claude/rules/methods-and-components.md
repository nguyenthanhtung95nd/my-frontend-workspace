# Rules: Functions & Components (TypeScript / React)

TypeScript companion to the stack-agnostic `structure.md` and `design-principles.md`.

## Functions & hooks

- Do **one thing only**. A function that fetches, transforms, and renders is three things.
- **Max 3 parameters.** More → group into a typed options/props object.
- **Never pass `bool` as a positional argument** — it hides intent. Prefer a discriminated
  union or two named functions (`<Button variant="primary">`, not `<Button primary>`).
- No hidden side effects. A custom hook that silently writes to storage or navigates must
  say so in its name (`usePersistedState`, `useRedirectIfUnauthed`).
- Extract custom hooks (`useX`) when component logic grows or repeats — keep components
  focused on rendering.

## Components

- **High cohesion, low coupling.** A component renders; business/data logic lives in
  hooks (`/lib` or colocated `use*`). Page files orchestrate, components render.
- Keep components small. If a component exceeds ~150 lines or mixes layout + data +
  business rules, split it (extract `ProductCard` from `ProductGrid`).
- Prefer **composition over configuration** — many focused components over one component
  with a dozen boolean/enum flags.
- Props are a typed contract: `interface Props { ... }`, no `any`, mark optional
  explicitly. Do not spread unknown props onto DOM nodes.
- Reusable UI in `/components`, logic/clients in `/lib`, routes/layouts in `/app` only.
  (See `context/architecture-nextjs.md` — folder hygiene.)

```tsx
// Bad — boolean arg, mixed concerns
<ProductCard product={p} featured={true} onBuy={...} />  // "featured" hides a whole layout

// Good — explicit variants, rendering only; data/handlers passed in
<FeaturedProductCard product={p} onBuy={handleBuy} />
```
