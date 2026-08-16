# Rules: Comments

- **Bad comments**: describe *what* the code does — the code must be self-documenting.
- **Good comments**: explain *why* a decision was made, or document non-obvious constraints.
- Use **TSDoc** (`/** ... */`) on exported/public API — shared functions, hooks, components,
  and types — where the contract isn't obvious from the signature. Don't document trivial
  internal helpers.
- No commented-out code — delete it. Git history is the backup.

```ts
// Bad
orderId++; // increment orderId

// Good
// Shopify order IDs are 1-based; subtract 1 to align with our 0-based internal index
const internalIndex = shopifyOrderId - 1;
```

```ts
/**
 * Retrieves an order by its unique identifier.
 *
 * @param id - The order ID. Must be greater than zero.
 * @returns The order if found, or `null` when no order matches `id`.
 * @throws {ApiError} When the request fails (network or non-2xx response).
 */
export async function getOrderById(id: number): Promise<Order | null>
```
