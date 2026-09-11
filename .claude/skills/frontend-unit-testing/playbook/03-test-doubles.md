# 03 - Test doubles

Replace real dependencies (DB, APIs, third-party services) with substitutes to isolate the unit --
faster, deterministic, and able to script edge cases. But mocks are a scalpel, not a sledgehammer.

## Vocabulary -- pick by intent
| Double | Purpose | Vitest |
|--------|---------|--------|
| **Stub** | supply a canned return; does not care how it was called | `vi.fn(() => value)` |
| **Spy** | record calls (args/count) while keeping real behavior | `vi.spyOn(obj, 'method')` |
| **Mock** | stub + spy: define behavior AND record calls | `vi.fn().mockResolvedValue(data)` |

If you find yourself asserting on a stub's calls, you actually wanted a mock. `vi.fn()` behaviors:
`mockReturnValue(Once)`, `mockResolvedValue(Once)`, `mockRejectedValue(Once)`,
`mockImplementation(Once)`. `*Once` chains are consumed in order, then fall through to the base.

## Spies keep the original unless you stub it
```ts
const errSpy = vi.spyOn(console, 'error');
handleError('declined');
expect(errSpy).toHaveBeenCalledWith('Error: declined');
errSpy.mockRestore();                       // spies on shared/global objects leak otherwise
```
`spyOn` runs the real method unless you chain `.mockReturnValue(...)`/`.mockImplementation(...)`.
Spying a module export needs the namespace form: `import * as m; vi.spyOn(m, 'fn')`.

## Mock a dependency -- narrowest surface first
```ts
// whole module (factory)
vi.mock('@/lib/api', () => ({ getReports: vi.fn(() => Promise.resolve([{ id: 'r1' }])) }));
// auto-mock: replace every export with vi.fn()
vi.mock('@/lib/api');
```
`vi.mock` is **hoisted** above imports, so the factory cannot close over local variables (prefix
`mock*` if it must, or use the non-hoisted `vi.doMock`). A factory replaces the whole module --
any export you forget returns `undefined`.

## Prefer the real thing; inject to make it testable
Before mocking, ask whether the real implementation can just run -- pure functions and lightweight
objects rarely need doubles. Make units testable by **injecting** collaborators instead of
constructing them inside:
```ts
class UserService {
  constructor(private api: { get(url: string): Promise<User> }) {}
  getUser() { return this.api.get('/user'); }
}
const fakeApi = { get: vi.fn().mockResolvedValue({ id: 1, name: 'A' }) };
expect(await new UserService(fakeApi).getUser()).toEqual({ id: 1, name: 'A' });
```
The unit depends on the shape (`.get`), not the concrete type. In React, inject via props/context
or a hook boundary. Without DI you are stuck mocking module internals (brittle) or hitting live
services.

## Mock sparingly, reset always
Mock only external boundaries (API/DB/fs/globals); let your own logic run. Over-mocking produces
tests that pass while the code is broken and break when internals change -- they assert
implementation, not behavior. Reset state between tests:
```ts
afterEach(() => {
  vi.clearAllMocks();      // wipe call history only
  // vi.resetAllMocks();   // + drop implementations (careful: erases impls set in beforeAll)
  // vi.restoreAllMocks(); // + restore originals (spies only; no-op on plain vi.fn)
});
beforeEach(() => vi.resetModules()); // when a module holds state across tests
```
Per-mock equivalents: `fn.mockClear()`, `fn.mockReset()`, `fn.mockRestore()`. Mock leakage and a
missing `resetModules()` are the top causes of flaky, order-dependent suites.
