# 03 - Memoization and the Compiler

Memoization is a scalpel, not a default. Every `useMemo`/`useCallback`/`React.memo` stores inputs and
runs a comparison on **every** render -- misapplied, the overhead beats the saving.

## useMemo / useCallback
```tsx
const stats = useMemo(() => computeStats(dataset), [dataset]);        // expensive transform only
const onToggle = useCallback((id: string) => setEditingId(c => c === id ? null : id), []); // for a memoized child
const config = useMemo(() => ({ type, colors }), [type]);             // stabilize an object prop
```
Skip both for primitives (`count * 2`), simple string joins, and always-changing deps (a live clock).
`useCallback` is pointless if the receiving child is not wrapped in `React.memo`. Depend on specific
fields (`config.apiUrl`), not whole objects, or caching is defeated.

## React.memo and custom equality
`React.memo` skips a re-render when props are shallow-equal. Provide `areEqual` to compare only the
fields that affect rendering -- and remember the return value is **inverted** (`true` = skip):
```tsx
const areEqual = (prev: Props, next: Props) =>
  prev.user.id === next.user.id &&
  prev.user.name === next.user.name &&
  prev.onEdit === next.onEdit;      // forgetting function props causes stale handlers
const Profile = React.memo(Component, areEqual);
```
Avoid `JSON.stringify` equality (slow, breaks on cycles). Never memoize a live-timestamp component or
trivial labels. Function props still need stable references or the compare always differs.

## Avoid over-memoization
Remove any memoization whose benefit you cannot measure -- you are paying rent on an unused cache.
Chained memos (each depending on the previous) add overhead; collapse them. The workflow is: build
first, profile, memoize only proven hotspots (10ms+ on a slow device), and delete when in doubt.

## The React 19 Compiler changes the default
The build-time React Compiler auto-memoizes computations, callback identity, and JSX creation from
inferred dependencies -- so on a compiled codebase you should **delete most manual memoization**.
```ts
// vite.config.ts -- opt-in first (see templates/vite.config.ts)
react({ babel: { plugins: [['babel-plugin-react-compiler', { compilationMode: 'opt-in' }]] } });
```
- **Prep:** turn on `StrictMode` everywhere, fix Rules-of-React violations, capture a baseline, roll
  out gradually (leaf components -> containers -> complex), and measure render time/count/bundle.
- **Keep** by hand: custom-equality `React.memo`, DOM-measurement ref callbacks, and genuinely
  expensive computations. Remove the trivial ones.
- **Escape hatch:** the `'use no memo'` directive per file/component while refactoring.

**GATED / caveats:** the Compiler is pre-release and requires idempotent components, immutable
props/state, and no side effects in render; libraries relying on referential equality for
*correctness* (some observer/proxy patterns) can break. Manual memo can conflict with compiler output
-- do not double up.
