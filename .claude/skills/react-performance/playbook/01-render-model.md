# 01 - Render model

Most React slowness is wasted re-renders. Fix the render model before reaching for memoization --
a component that never re-renders needs no cache.

## Reconciliation basics
React diffs by element **type** and tree **position**. A different type tears down and rebuilds the
subtree (losing state, re-running effects); a shifted position cascades re-renders. Keep both stable:
```tsx
// stable type + position; conditional content, not conditional element
<div className={theme}>{isLoggedIn ? 'Welcome' : 'Log in'}</div>
```
A conditional `{show && <A />}` placed before a sibling changes the sibling's position -- render it
always and toggle `hidden` instead.

## Stable keys in lists
Key by a stable unique id, never the array index or a random value -- index/random keys make an
insert or reorder look like an edit to every row, causing remounts, lost focus, broken animations,
and re-run effects.
```tsx
{todos.map(t => <TodoItem key={t.id} todo={t} />)}
const todo = { id: crypto.randomUUID(), text }; // generate the id at creation
```
Keys need to be unique only among siblings; do not encode extra data into them.

## Identity stability of props
Reference identity (not contents) decides prop/dep/context equality. A new object/array/function
each render defeats `React.memo`, re-runs `useEffect`, and re-renders every context consumer.
```tsx
const CONFIG = { theme: 'dark', timeout: 5000 };     // hoist static values out of the component
const onToggle = useCallback((id) => toggle(id), []); // stabilize a handler for a memoized child
```
Do not stabilize trivial values passed straight through -- let the child memoize if it needs to.

## Component granularity
Split components along **state boundaries**: isolate independent and frequently-updating state so a
change re-renders only its own subtree.
```tsx
function QuantitySelector() { const [q, setQ] = useState(1); /* only this re-renders */ }
```
Do not over-split ("confetti components") -- that just creates prop drilling. Split for a measured
render win, not for organization.

## Colocation and lifting
Keep state as close to where it is used as possible; start local and push state **down** out of
top-level components (root state re-renders the whole tree). Lift **up** only when peers genuinely
share, coordinate, or sync -- and only to the closest common parent.
```tsx
function OrderManagement() {              // justified lift: list + detail must coordinate
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return <><OrderList selectedId={selectedId} onSelect={setSelectedId} /><OrderDetails id={selectedId} /></>;
}
```
Do not lift high just to dodge prop drilling (use context) or to future-proof (YAGNI). Prefer several
focused state slices over one monolithic object. A few extra re-renders are fine -- only optimize
lag you can measure.
