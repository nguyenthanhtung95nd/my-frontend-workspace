# Rules: Testing (Next.js / React)

## Testing pyramid

| Type | Target | Tool | Purpose |
|------|--------|------|---------|
| Unit / component | ~70% | Jest + React Testing Library | Behavior of components, hooks, utils |
| Integration | ~20% | RTL + MSW (mock network) | Component ↔ data-layer interaction |
| E2E | ~10% | Playwright | Real user journeys across pages |

## Test behavior, not implementation

- Query by **role and accessible name** (`getByRole('button', { name: /add/i })`), not
  by test-id or class. If a test can't find an element by role, that's often an
  accessibility bug worth fixing.
- Assert what the **user sees and does** — rendered output, state after interaction,
  navigation — never internal state, hook internals, or render counts.
- **Do not mock what you're testing.** Mock the network (MSW), the clock, and truly
  external services — not the component under test.
- No snapshot-only tests as the primary assertion; they lock in markup, not behavior.

## Rules

- Every reusable component and custom hook has tests covering: happy path, empty,
  loading, and error states (mirrors `error-handling-nextjs.md`).
- Deterministic: no real network, no `Date.now()`/random without injection, no sleeps.
- Structure: **Arrange → Act → Assert**; name `describe(Component) > it('does X when Y')`.
- E2E covers auth-gated flows and RBAC (a non-admin must not reach admin actions).
- Tests must pass in CI before merge. Fix or delete — never leave `.skip` without a
  linked issue.

```tsx
it('shows an error state when the request fails', async () => {
  server.use(rest.get('/api/products', (_, res, ctx) => res(ctx.status(500))))
  render(<ProductGrid />)
  expect(await screen.findByText(/couldn't load/i)).toBeInTheDocument()
})
```
