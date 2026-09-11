# 04 - Concurrent features

React's concurrent rendering (18+) lets urgent work (typing, clicks) interrupt expensive work. These
do not make code faster -- they make it **non-blocking** -- so still combine them with memoization
and virtualization. GATED: they need React 18/19 (some 19-only, noted).

## useTransition / startTransition
Mark a non-urgent update so the urgent one stays responsive:
```tsx
const [isPending, startTransition] = useTransition();
setQuery(value);                                     // urgent: input updates immediately
startTransition(() => setResults(expensiveSearch(value))); // interruptible background work
```
Use `isPending` for a subtle loading hint. Import standalone `startTransition` when you do not need
`isPending`. Do **not** wrap validation feedback, navigation, or trivial updates. Beware stale
closures inside the callback -- read fresh values.

## useDeferredValue
Defer an expensive derived value so the source input stays fluid -- adaptive, unlike a fixed debounce
(it defers only while React is busy):
```tsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => search(deferredQuery), [deferredQuery]); // must pair with useMemo
const isStale = query !== deferredQuery;              // show a dimmed overlay while stale
```
Defer the input, not the computed result; do not defer critical validation.

## use() (React 19)
Unwrap a promise or context during render and let Suspense drive loading/errors; unlike `useContext`
it is callable conditionally:
```tsx
const user = use(userPromise);   // wrap the tree in <Suspense> + an error boundary
```
A **fresh promise each render loops forever** -- memoize/cache it. `use()` is render-only. Sequential
`use()` calls create waterfalls; kick off the promises in parallel first.

## useActionState (React 19)
Collapse a mutation's pending/success/error into one batched render, with duplicate-submit protection
and `aria-busy` wired in:
```tsx
const [state, formAction] = useActionState(action, initialState); // action: (prev, formData) => next
```
Use a discriminated-union state shape for type safety; pairs with Server Actions. Not worth it for
simple synchronous/client-only state.

## Selective hydration
Wrap lower-priority sections in Suspense so React hydrates them independently and auto-prioritizes
the one a user interacts with:
```tsx
<Suspense fallback={<Skeleton />}><BelowTheFoldWidget /></Suspense>
```
Group related content (do not Suspense per tiny component), size skeletons to final content (avoid
CLS), and always pair with an error boundary.

## Escape hatches: useLayoutEffect and flushSync (use rarely)
`useLayoutEffect` runs synchronously **before paint** -- only for measuring or read-then-write to
avoid a visible flicker; it blocks paint, so keep non-visual work in `useEffect`.
`flushSync(() => setState(v))` forces a synchronous DOM flush (breaking batching, blocking the thread)
-- justified only when imperative code needs the updated DOM immediately (focus, measure, re-init a
third-party lib). It interrupts transitions and conflicts with Suspense.
