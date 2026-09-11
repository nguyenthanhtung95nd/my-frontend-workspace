// Global test setup, wired via `test.setupFiles` in vitest.config.ts. Runs once per test file.
import { afterAll, afterEach, beforeAll } from 'vitest';

// 1. jest-dom matchers (toBeInTheDocument, toBeDisabled, ...). Import once here, not per test.
import '@testing-library/jest-dom/vitest';

// 2. Mock Service Worker: intercept at the network level. Define handlers in mocks/handlers.ts.
//    Uncomment once `msw` is installed and handlers exist.
//
// import { setupServer } from 'msw/node';
// import { handlers } from './mocks/handlers';
// export const server = setupServer(...handlers);
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // fail loudly on a missing handler
// afterEach(() => server.resetHandlers());                         // or per-test overrides leak
// afterAll(() => server.close());

// 3. Reset shared DOM state between tests so nothing leaks (top cause of order-dependent flakes).
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Keep the empty hooks referenced so tree-shakers do not complain before MSW is enabled.
void beforeAll;
void afterAll;
