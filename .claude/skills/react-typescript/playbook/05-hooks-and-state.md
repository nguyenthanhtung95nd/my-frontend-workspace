# 05 - Hooks and state

## useState
Let TS infer primitives; annotate arrays, objects, unions, and nullable async data.
```tsx
const [count, setCount] = useState(0);              // inferred number
const [items, setItems] = useState<string[]>([]);    // an empty [] would infer never[]
const [user, setUser] = useState<User | null>(null);
const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
setItems(prev => [...prev, item]);                   // functional update avoids stale closures
```
Lazy init for expensive setup: `useState<Todo[]>(() => JSON.parse(...))`.

## useRef and imperative handles
Refs start `null` and have specific DOM types; read them in effects and guard `current`.
```tsx
const inputRef = useRef<HTMLInputElement>(null);     // DOM ref
const timer = useRef<number>();                       // mutable value
useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);
```

## Custom hooks with generics
Abstract repeated stateful logic while preserving inference at each call site.
```ts
function useApi<T>(url: string): { data: T | null; loading: boolean } { /* ... */ }
function useForm<T extends Record<string, unknown>>(initial: T) {
  function setValue<K extends keyof T>(field: K, value: T[K]) { /* ... */ }
  return { setValue } as const;                       // `as const` for a tuple return
}
```
Prefer object returns over long tuples; do not over-constrain (`T = any` default is fine).

## Effect typing
`useEffect` runs after paint; `useLayoutEffect` before paint -- use the latter only for synchronous
measurement/flicker fixes. Cleanup must be **synchronous** (never return a Promise).
```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();                    // sync cleanup
}, [url]);
```
Empty deps + an event handler = stale closure -- use a functional `setCount(c => c + 1)`.

## Typed context + a safer createContext
The default `createContext<T | undefined>(undefined)` forces repetitive null checks. Wrap it so
consumers never see `undefined`, and it throws outside a provider:
```tsx
function createSafeContext<T>(name: string) {
  const Ctx = createContext<T | null>(null);
  Ctx.displayName = name;
  function useCtx() {
    const v = useContext(Ctx);
    if (v === null) throw new Error(`use${name} must be used within ${name}Provider`);
    return v;
  }
  return [useCtx, Ctx.Provider] as const;
}
```
Split state and actions into separate contexts so writers do not re-render on state changes, and
**memoize the provider value**. For slice subscriptions, use `useSyncExternalStore` with a selector.

## Reducers and dispatch
Type the action union and check exhaustiveness; `dispatch` from `useReducer` is already stable.
```ts
type Action = { type: 'add'; text: string } | { type: 'toggle'; id: string };
function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add': /* ... */
    default: { const _e: never = action; return state; }
  }
}
```
Expose actions via a hook that returns `useMemo(() => ({ addTodo }), [dispatch])` -- forgetting the
`useMemo` causes infinite re-renders.

## State libraries
`useState`/context suit local and low-frequency global state. For high-frequency global state, context
causes re-render storms -- reach for an external store. Type the store once and export typed hooks
(e.g. `RootState = ReturnType<typeof store.getState>`) so state feels native instead of annotating per
call.
