# Rules: Design Principles

## SOLID

| Principle | TypeScript / React Application |
|-----------|--------------------------------|
| **S** — Single Responsibility | One module/component, one reason to change. Split a `useUser` hook that both authenticates and fetches profile into `useAuth` + `useUserProfile` when responsibilities diverge |
| **O** — Open/Closed | Extend via composition and new components, not by editing existing ones. Prefer many focused components + variants over one component with a growing set of flags |
| **L** — Liskov Substitution | A component/hook must honor its declared prop/return contract. A variant of `<Button>` must still behave as a button — never render nothing or throw for a supported prop combination |
| **I** — Interface Segregation | Small, focused prop/type contracts over fat ones. `interface Reader { ... }` + `interface Writer { ... }` instead of one `DataStore` type that forces every consumer to know everything |
| **D** — Dependency Inversion | Depend on abstractions. Pass data/handlers in as props; inject clients via a hook or context — never `import { db } from '@/lib/firebase'` deep inside a presentational component |

## Additional Rules

- **YAGNI** — Do not implement features not required by the current ticket.
- **Design for testability** — if it's hard to test, the design is wrong. If a component
  can't be tested by role/behavior, that's usually a coupling or a11y bug worth fixing.
- **Wrap third-party SDKs** — never call the Stripe/Firebase SDK directly from a component.
  Wrap it behind a typed function/hook in `/lib` so business logic depends on your contract,
  not the vendor's.

```ts
// Bad — component coupled to the Stripe SDK
import Stripe from 'stripe'
async function charge(amount: number) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  await stripe.paymentIntents.create({ amount, currency: 'usd' })
}

// Good — depend on an abstraction in /lib (and this runs server-side only)
import { paymentGateway } from '@/lib/payments'
async function charge(amount: number) {
  await paymentGateway.charge(amount) // PaymentGateway interface
}
```

- **Pages/route handlers are humble objects** — an `app/**/page.tsx` composes components
  and orchestrates; a `route.ts` maps the request to a `/lib` service and returns a
  response. Business/data logic lives in `/lib` and hooks, not inline in routes.
- **Dependencies flow one way** — `/app` and `/components` depend on `/lib`; `/lib` never
  imports from `/app` or `/components`. Presentational components never reach into the data
  layer directly.
- **Right-size your solution** — do not introduce a state manager, a monorepo, or a generic
  abstraction layer unless the problem genuinely demands it. Solve today's problem; design
  for tomorrow's scale.
