# Testing Guide — Next.js (Jest + RTL + Playwright)

## Component test (Jest + React Testing Library)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/ThemeToggle'

it('switches theme when the toggle is pressed', async () => {
  render(<ThemeToggle />)
  const toggle = screen.getByRole('button', { name: /toggle theme/i })  // by role, not test-id
  await userEvent.click(toggle)
  expect(document.documentElement).toHaveClass('dark')
})
```

## Network mocking (MSW) — do not mock the component under test

```tsx
// test/server.ts
import { setupServer } from 'msw/node'
import { rest } from 'msw'
export const server = setupServer(
  rest.get('/api/products', (_, res, ctx) => res(ctx.json([{ id: '1', title: 'Mug', price: 9.99 }]))),
)
// jest.setup.ts: beforeAll(() => server.listen()); afterEach(() => server.resetHandlers()); afterAll(() => server.close())
```

Assert loading, empty, error, and success states by driving MSW responses.

## E2E (Playwright) — real journeys + RBAC

```ts
import { test, expect } from '@playwright/test'

test('non-admin cannot reach admin actions', async ({ page }) => {
  await loginAs(page, 'user')
  await page.goto('/admin/users')
  await expect(page.getByText(/forbidden/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /edit role/i })).toHaveCount(0)
})
```

## Conventions

- Query by role/accessible name; if you can't, fix the a11y gap.
- One logical scenario per test; Arrange → Act → Assert.
- Deterministic: MSW for network, inject clock, no real timers/sleeps.
- Cover happy + empty + loading + error for every data-driven component.
- CI runs unit+integration on every PR, Playwright on PR to main.
