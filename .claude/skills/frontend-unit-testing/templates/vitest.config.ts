import { defineConfig } from 'vitest/config';
import path from 'path';

// Starter Vitest config for a Vite + React + TS project. Clone and adapt.
// Runner options live under `test`; keep aliases aligned with tsconfig paths.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    globals: true,          // describe/it/expect without imports
    environment: 'jsdom',   // DOM for component/localStorage tests ('happy-dom' is faster)
    setupFiles: './setup.ts',
    isolate: true,          // fresh context per file (safer; disable only if proven side-effect-free)
    testTimeout: 5000,
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts', '**/*.config.*'],
      reporter: ['text', 'html', 'lcov'],
      // Keep thresholds low; they guard against a silent coverage collapse, not a target.
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
