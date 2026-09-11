# 08 - SSR, libraries and testing

The type contracts here are portable and local-first; only their wiring is GATED on the surrounding
infrastructure (RSC framework, SSR host, federation/monorepo build, publish pipeline).

## Server Components and Server Actions
Only JSON-serializable data crosses the server -> client boundary -- enforce it with a type and strip
non-serializable fields on the server.
```ts
type Serializable = string | number | boolean | null | { [k: string]: Serializable } | readonly Serializable[];
const toClient = (p: DbProduct): ClientProduct => ({ id: p.id, createdAt: p.createdAt.toISOString() });
```
Passing a `Date`, function, or class instance silently breaks serialization. Guard server/client
modules with `import 'server-only'`/`'client-only'`. Type a Server Action as validated RPC returning a
standard result:
```ts
function createAction<I, O>(schema: z.ZodSchema<I>, run: (i: I) => Promise<O>) {
  return async (input: unknown): Promise<{ ok: boolean; data?: O; fieldErrors?: Record<string, string[]> }> => {
    const r = schema.safeParse(input);
    return r.success ? { ok: true, data: await run(r.data) } : { ok: false, fieldErrors: r.error.flatten().fieldErrors };
  };
}
```
Async Server Components return `Promise<JSX.Element>`.

## Edge / streaming SSR types
Runtimes differ (DOM vs Node vs Edge) -- guard runtime-specific globals and read browser APIs in
effects.
```ts
const width = typeof window !== 'undefined' ? window.innerWidth : 0;   // avoid "window is not defined"
```
Edge exposes Web APIs only (no Node `fs`); set tsconfig `lib` deliberately and treat SSR payloads as
`unknown` + narrow. Model streaming as a discriminated union
(`pending | streaming (Partial<T>) | complete | error`); shell errors are unrecoverable
(`onShellError`).

## Realtime typing (WebSocket / SSE)
Network data is untrusted -- validate every inbound message with a discriminated-union schema, and
reconnect with backoff + jitter.
```ts
const Message = z.discriminatedUnion('type', [z.object({ type: z.literal('update'), id: z.string(), value: z.number() })]);
ws.onmessage = (e) => { const p = Message.safeParse(JSON.parse(e.data)); if (p.success) onMessage(p.data); };
```
Evolve the protocol via optional fields, added union variants, or a `version` branch.

## Performance contracts in types
Separate data props (drive rendering) from action props (stable), and make immutability explicit --
`React.memo` only helps when references are stable.
```ts
type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };
```
See **react-performance** for the runtime side. With the **React Compiler** on, write idiomatic code
(`as const` for stable literals) and remove manual memoization; `'use no memo'` opts a component out.
Dynamic property access and `import(variable)` cannot be optimized.

## Typed code-splitting
`React.lazy` resolves `{ default: Component }` and infers props automatically -- the module needs a
**default export** (wrap a named one). Wrap the lazy tree in `Suspense` + an error boundary. A dynamic
`import(\`./${x}\`)` blocks static analysis.

## Libraries and monorepos (GATED wiring)
- **Module federation:** remotes are unknown at build time -- `declare module 'remoteApp/Button'` to
  restore types; share `react`/`react-dom` as singletons; centralize a `@org/shared-types` package.
- **Monorepos:** TS project references (`composite: true` + `references`) give a single source of
  truth, incremental builds, and cross-package go-to-definition; `react` is a `peerDependency` in the
  UI package.
- **Publishing a library:** emit `declaration` + `declarationMap`, export intentionally (no
  `export *`, which leaks internals), and version types under semver -- narrowing a type or making a
  prop required is a breaking change.

## Typed testing
Keep tests fully typed and test the runtime gaps types cannot guarantee ("compiles" != "works").
```tsx
const mockFetch = vi.mocked(fetchUser);
const makeUser = (o: Partial<User> = {}): User => ({ id: '1', name: 'T', email: 't@x.io', ...o });
const { result } = renderHook(() => useCounter(5));
```
Prefer `getByRole`/`getByLabelText`; `find*` is async, `query*` is nullable. Do not test what the
types already guarantee. The test mechanics live in **frontend-unit-testing**.
