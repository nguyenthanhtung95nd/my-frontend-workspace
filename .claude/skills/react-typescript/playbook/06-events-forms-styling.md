# 06 - Events, forms and styling

## DOM and React events
Use React's specific SyntheticEvent types (event + element), and read `currentTarget`, not `target`.
```tsx
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value);
const onSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); };
const onClick = (e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.blur();
```
`event.target` is a bare `EventTarget` (no `.value`); `currentTarget` is the element the handler is
attached to. `onKeyPress` is deprecated -- use `onKeyDown`. Global `document` listeners use
`globalThis.KeyboardEvent`, not React's.

## Forms and number inputs
DOM controls always yield **strings** -- coerce explicitly and handle empty/`NaN`.
```tsx
const onChange = <T extends HTMLInputElement | HTMLTextAreaElement>(e: React.ChangeEvent<T>) =>
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
const n = value === '' ? 0 : Number(value);
if (!Number.isNaN(n)) setAge(n);
```

## Form actions and useActionState (React 19)
Model a mutation as `(prevState, formData) => Promise<Result>` wired to `<form action>`; you get
`isPending` and progressive enhancement for free.
```tsx
type Result = { success: boolean; errors?: Record<string, string[]> };
const [state, formAction, isPending] = useActionState(submit, { success: false });
```
`formData.get()` returns `FormDataEntryValue` -- cast it. Do not auto-retry non-idempotent mutations.

## useOptimistic (React 19)
Instant feedback with a typed action reducer; apply optimistically, then revert on failure.
```tsx
type Action = { type: 'toggle'; id: string } | { type: 'revert'; id: string };
const [optimistic, add] = useOptimistic(items, (cur, a: Action) => /* ...exhaustive never default */);
```
Track pending items with a `tempId`, swap to the real id on confirm, and announce via `aria-live`.

## flushSync + imperative DOM (sparingly)
React batches updates asynchronously, so a ref reads stale layout right after `setState`. Force a
flush only when you must measure/focus immediately after an update:
```tsx
flushSync(() => setItems(prev => [...prev, item]));
listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
```
Batch all updates into one `flushSync`, never in a loop; prefer `useLayoutEffect` for pure
measurement.

## ARIA typing
Encode accessibility constraints as types so an inaccessible prop combination fails to compile (React's
built-in `AriaAttributes` are permissive and won't enforce relationships):
```tsx
type Label = { children: React.ReactNode } | { 'aria-label': string } | { 'aria-labelledby': string };
```
Types cannot replace real screen-reader testing.

## Styling
`CSSProperties` derives from `csstype`; use it (or `Property.*`) for precise inline styles, and spread
a user-supplied `style` **last** so overrides win. Restrict design-system props to token keys
(`keyof ThemeColors`). For Tailwind, build variant APIs with `cva` and derive prop types from
`VariantProps<typeof x>`; pass `className` through `cva()` so caller overrides merge.

## Typed routes
URL params are strings -- validate/transform them through a schema before use, in a typed hook:
```tsx
const schema = z.object({ userId: z.string().transform(Number).pipe(z.number().positive()) });
function useTypedParams<T>(s: z.ZodSchema<T>): T {
  const r = s.safeParse(useParams());
  if (!r.success) throw new Error(r.error.message);
  return r.data;
}
```
Avoid non-null assertions (`userId!`); keep param schemas lightweight (they run on every navigation).
