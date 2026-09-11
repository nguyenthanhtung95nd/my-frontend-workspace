# 04 - Mocking recipes

Concrete substitutions for the things that make tests slow or non-deterministic. Always restore in
cleanup, or the fake bleeds into later tests.

## Time
```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());        // MUST restore or the whole suite runs frozen

vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));   // pin "now" (prefer over the epoch arg)
vi.advanceTimersByTime(1000);                          // run pending setTimeout
await vi.advanceTimersByTimeAsync(1000);               // promise-based timers
```
`useFakeTimers()` replaces `Date`, timers, and `performance.now`. Time is frozen until advanced;
`runAllTimers` throws at ~10k iterations on an uncleared `setInterval`.

## Environment variables
```ts
beforeEach(() => vi.stubEnv('MODE', 'production'));
afterEach(() => vi.unstubAllEnvs());        // or set unstubEnvs: true in config
```
`stubEnv` coerces values to strings. If the module reads env at load time, stub before importing
it. Vite code reads `import.meta.env` (`MODE`, `VITE_*`).

## Fetch / network (single call)
```ts
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) } as Response)));
await expect(getData()).resolves.toEqual({ id: 1 });
expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
// error path
vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));
```
In Node/jsdom `fetch` is global -- stub `globalThis.fetch`, not `window`. Provide `ok`/`status` if
the code checks them. Clean up with `vi.unstubAllGlobals()`. For anything beyond one or two calls,
prefer MSW below.

## Network (realistic) -- Mock Service Worker
Mock at the **network level**, not the fetch/module level: the code under test is unchanged, and
handlers are reusable.
```ts
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';
export const handlers = [http.get('/api/user', () => HttpResponse.json({ id: '123', name: 'John' }))];
// setup.ts
import { setupServer } from 'msw/node';
export const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));  // fail loudly on a missing handler
afterEach(() => server.resetHandlers());                          // or overrides leak across tests
afterAll(() => server.close());
// per-test error override
server.use(http.get('/api/user', () => new HttpResponse(null, { status: 500 })));
```
Use MSW v2 (`http`/`HttpResponse`), not v1 (`rest`/`res(ctx...)`). Assert async UI with `findBy*`.

## File system
```ts
import { readFile, writeFile } from 'fs/promises';
vi.mock('fs/promises');
(readFile as Mock).mockResolvedValue('Hello');
```
`fs` and `fs/promises` are distinct modules -- mock the exact import path. For real read/write
semantics without disk, back it with `memfs`. Forgetting `mockResolvedValue` returns `undefined`.

## Object properties, getters, globals
```ts
vi.spyOn(window, 'location', 'get').mockReturnValue({ href: 'https://mock' } as Location);
Object.defineProperty(window, 'innerWidth', { get: () => 1024, configurable: true });
```
Direct assignment to a getter-only property throws -- use `Object.defineProperty` with
`configurable: true`, or `vi.stubGlobal` for a whole global. Snapshot and restore originals.

## DOM methods
Assert what the user sees over internals; spy on a DOM API only when the call itself is the
behavior. Requires `environment: 'jsdom'`.
```ts
const spy = vi.spyOn(document, 'getElementById').mockReturnValue({ textContent: '0' } as HTMLElement);
// ...
spy.mockRestore();
```

## Auto-mock caveat
`vi.mock('@/lib/api')` (no factory) stubs every export as a no-op `vi.fn()` -- convenient, but any
export you rely on now returns `undefined` unless you give it an implementation.
