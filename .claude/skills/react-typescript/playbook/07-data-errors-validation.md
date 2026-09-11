# 07 - Data, errors and validation

## Validate external data at the boundary
Types are erased at runtime, so `return data as User` is a lie -- one backend change silently corrupts
the tree. Parse every response, param, and message through a schema, and derive the type from it.
```ts
const UserSchema = z.object({ id: z.string(), email: z.string().email() });
type User = z.infer<typeof UserSchema>;               // single source of truth
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(res.statusText);
  return UserSchema.parse(await res.json());           // or safeParse for graceful handling
}
```
Validate **once** at the boundary and pass typed data down without re-validating -- the runtime cost
is negligible next to the network. Model the async lifecycle as a discriminated `AsyncState<T>`.

## Result types -- model failure as values
Return a discriminated union instead of throwing, so callers must handle both branches:
```ts
type CreateUser =
  | { status: 'success'; userId: string }
  | { status: 'validation-error'; issues: string[] }
  | { status: 'network-error' };
```
Keep an exhaustive `never` default. Re-map infrastructure errors to domain errors at the boundary. A
typed error taxonomy (network/validation/business/system) with an `isRetryable` flag lets an API
client retry only recoverable errors (never 4xx) with backoff + `AbortController`.

## Error boundaries + Suspense
Error boundaries are class components -- type state/props with `ErrorInfo`.
```tsx
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { this.props.onError?.(error, info); }
}
// compose: <ErrorBoundary><Suspense fallback={<Spinner/>}>{children}</Suspense></ErrorBoundary>
```
Boundaries do **not** catch event handlers, async code, or SSR -- for async, `catch` then `setError`
and `if (error) throw error` during render so the boundary sees it. Add a `resetErrorBoundary` guarded
by `retryCount < max`.

## Typed data layer (React Query / tRPC)
Prefer end-to-end inference over hand-syncing frontend/backend types:
```ts
export type AppRouter = typeof appRouter;             // server (GATED: needs a backend)
export const trpc = createTRPCReact<AppRouter>();     // client -- queries are fully typed
```
With vanilla React Query (local-first typing): type the fetchers, use `['user', id] as const` keys,
and `useQuery<Data, Error>`. Invalidate surgically (`utils.x.invalidate({ id })`), never blanket.

## use() typing (React 19)
`use()` unwraps a promise with an inferred type and is callable conditionally. **Never create the
promise in render** -- memoize it, or it refetches every render.
```tsx
const userPromise = useMemo(() => fetchUser(id), [id]);
const user = use(userPromise);
```

## Security: branded trusted content
Make sanitization non-optional by branding strings so `dangerouslySetInnerHTML` only accepts
`TrustedHtml`:
```ts
type UntrustedString = string & { readonly __brand: 'Untrusted' };
type TrustedHtml = string & { readonly __brand: 'TrustedHtml' };
function sanitize(c: UntrustedString): TrustedHtml { return DOMPurify.sanitize(c) as TrustedHtml; }
```
Brands are compile-time only -- pair with a real sanitizer + CSP headers and test against payloads.

## Migrating to TypeScript
- **From JS:** incremental, file by file. Start permissive (`allowJs`, `strict: false`), convert leaf
  files, type boundaries first (props/hooks/API interfaces + schemas), then ratchet strictness one
  flag at a time. Mark temporary `any` with a `TODO_TYPE` alias; convert `defaultProps` to defaults.
- **From PropTypes:** replace runtime warnings with compile-time interfaces (`oneOf` to a literal
  union, `shape` to an interface, `func` to a precise signature), migrate leaf to parent, and remove
  the `prop-types` dependency last. `children: React.ReactNode` matches `PropTypes.node`. Still
  validate external data at runtime.
