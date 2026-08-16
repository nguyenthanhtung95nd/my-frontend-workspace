# Rules: Code Structure

## The Four Rules (Non-Negotiable)

1. **Write code that is easy to understand.**
2. **Write code that can have as few bugs as possible.**
3. **Constantly clean up your code (refactor).**
4. **Write code that creates value for customers.**

## Single Responsibility Principle (SRP) — Most Critical

- Every function, hook, component, and module does **exactly one thing**.
- If a name contains "And" → split it. (`validateAndSaveOrder` → two functions.) A component
  that fetches, transforms, and renders is three things — extract the data into a hook.
- No nested `if` blocks beyond 2 levels. No nested `try/catch`.

## Size Limits

- Functions/hooks: **< 20 lines**
- Components: **< 150 lines** — if it mixes layout + data + business rules, split it
  (extract `ProductCard` from `ProductGrid`).
- The more complex the logic, the shorter it must be.

## DRY — Don't Repeat Yourself

- Never copy-paste logic. Extract into a shared function (`/lib`), a custom hook, or a
  component.
- Exception: duplicating 2–3 trivial lines is acceptable if abstraction adds more
  indirection than value.

## Levels of Abstraction

- Each function operates at **one level of abstraction** only.
- High-level code calls mid-level helpers — it does not contain low-level detail.

```tsx
// Bad — route handler bypasses the data layer
export async function POST(req: Request) {
  const body = await req.json()
  const ref = await addDoc(collection(db, 'orders'), { ...body, createdAt: Date.now() })
  return Response.json({ id: ref.id })
}

// Good — thin handler delegates to /lib
export async function POST(req: Request) {
  const result = await orderService.create(await req.json())
  return result.ok
    ? Response.json(result.value)
    : Response.json({ error: result.error }, { status: 400 })
}
```

## Variables & State

- Declare variables **as close as possible** to where they are used, and initialize at
  declaration.
- Prefer `const`; use `let` only when reassignment is genuinely needed. Never `var`.
- Mark immutable data `readonly` / `as const`; type props as read-only contracts.
- **No module-level mutable state** — no top-level `let` that changes at runtime as a
  hidden store. Component state belongs in `useState`/store, shared data in a cache layer.
- **Derive state, don't duplicate it** — `isLoading`/`isEmpty` come from one source; don't
  track them as separate `useState`.

## Conditionals & Control Flow

- **Minimize boolean logic** — it is the highest source of bugs.
- Replace `if/else if` chains with a lookup map, a discriminated union, or polymorphism.
- Use **union types / enums** instead of loose string comparisons; narrow at the boundary.
- Use **guard clauses** (early returns) to reduce nesting.

```tsx
// Bad
function process(order: Order | null) {
  if (order) {
    if (order.isValid) {
      // logic buried 2 levels deep
    }
  }
}

// Good
function process(order: Order | null) {
  if (!order) return
  if (!order.isValid) return

  // logic at top level
}
```

## Null Handling

- Enable strictness: `"strict": true` (incl. `strictNullChecks`) in `tsconfig.json`.
  Never disable it or paper over a null with `!` (non-null assertion) or `@ts-ignore`.
- Never return `null` from a function that returns a collection — return an empty array `[]`.
- Guard `undefined`/`null` at the boundary (optional chaining `?.`, nullish coalescing `??`,
  early returns) rather than letting it flow into render and crash the UI.
