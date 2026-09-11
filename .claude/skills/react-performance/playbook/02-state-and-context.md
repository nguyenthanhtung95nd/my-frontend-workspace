# 02 - State and context

## Derive, do not store
Store the minimal source of truth; compute totals, counts, filters, and validation on render. A
second stored copy of computed data is the classic desync bug and adds extra renders (three
`setState` calls = three renders).
```tsx
const [items, setItems] = useState<CartItem[]>([]);
const total = items.reduce((s, i) => s + i.price, 0);   // derived, one source of truth
const isFormValid = isNameValid && isEmailValid;         // derived, not stored
const filtered = useMemo(() => items.filter(expensiveMatch), [items, query]); // memo only if expensive
```
Store only user input, fetched data, or genuinely distinct app state. Do not reach for `useMemo`
reflexively -- most derivations are cheap enough to run every render.

## Context is a broadcast, not an optimizer
Every consumer re-renders when the context value changes, and a **new value object each render**
re-renders all of them. Three rules:

1. **Memoize the value.**
   ```tsx
   const value = useMemo(() => ({ user, isAdmin, updateUser }), [user, updateUser]);
   ```
2. **Split contexts by domain and update frequency** -- avoid the kitchen-sink context where any
   field change re-renders everything.
3. **Keep high-frequency data out of context entirely** -- mouse position, animation frames, and
   form keystrokes belong in local state, a ref, an external store, or the URL. Reserve context for
   truly global, rarely-changing values (theme, auth, locale).

## Split state from actions (two contexts)
Recreated updater functions change a single context's value object every render, re-rendering even
components that only dispatch. Put state and (stable) actions in separate contexts:
```tsx
const StateContext = createContext<Todo[]>([]);
const ActionsContext = createContext<Actions | null>(null);

const [todos, dispatch] = useReducer(todoReducer, []);
const actions = useMemo(() => ({
  addTodo: (text: string) => dispatch({ type: 'ADD_TODO', text }),
  toggleTodo: (id: string) => dispatch({ type: 'TOGGLE_TODO', id }),
}), []);   // dispatch is stable -> actions never change -> writers don't re-render on state change
```
Wrap each in a hook (`useTodos`, `useTodoActions`) that throws outside its provider. This also makes
the reducer unit-testable in isolation. Overkill for small trees where every consumer needs both.

## When context is not enough
For selector-based subscriptions (re-render only on the slice you read), use an external store via
`useSyncExternalStore` (or a store library) instead of context:
```tsx
const count = useSyncExternalStore(store.subscribe, () => store.getState().notifications.length);
```
