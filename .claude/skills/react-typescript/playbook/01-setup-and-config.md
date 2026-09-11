# 01 - Setup and config

## tsconfig for React + Vite
Vite compiles; TypeScript only type-checks (`noEmit: true`). The strict flags are a package deal --
do not disable `strict`.
```jsonc
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "jsx": "react-jsx", "strict": true, "noEmit": true,
    "isolatedModules": true,          // required by Vite/esbuild
    "verbatimModuleSyntax": true,     // forces `import type`
    "moduleDetection": "force",
    "noImplicitReturns": true, "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true, "incremental": true,
    "types": ["vite/client"],
    "baseUrl": ".", "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```
Split configs: `tsconfig.node.json` (Vite config, Node types) and a stricter `tsconfig.build.json`
for libraries. Verify a resolved config with `tsc --showConfig`. Do not use the legacy
`moduleResolution: "node"`.

## Strictness that pays off (adopt in this order)
On a new project turn `strict: true` on day one; on legacy code adopt option-by-option so you are not
flooded:
1. `noImplicitAny` -- type props/state (`useState<User | null>(null)`).
2. `strictNullChecks` -- catches the most React bugs (optional props, async state).
3. `noImplicitReturns` -- a component must return JSX or `null` on every path.
4. `strictFunctionTypes` -- correct event-handler signatures.
Advanced: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Use `// @ts-expect-error` (with a
reason) for rare legitimate overrides -- never a bare `@ts-ignore`.

## ESLint + Prettier
Use flat config: `js.recommended` + `typescript-eslint` (strict) + react + react-hooks +
react-refresh, and Prettier via `eslint-config-prettier` (last). Turn off `react/prop-types` and
`react/react-in-jsx-scope` (redundant with TS + the modern JSX transform); keep `rules-of-hooks:
error` and `exhaustive-deps: warn` (prevents stale-closure bugs). Never disable `rules-of-hooks`.

## Build pipeline: separate type-check from transpile
`tsc` is thorough but slow. Let a fast transpiler (SWC/esbuild via `@vitejs/plugin-react-swc`) strip
types for output, and run `tsc --noEmit` for type-checking + `.d.ts` emission.
```jsonc
{ "scripts": { "build": "tsc --noEmit && vite build", "type-check": "tsc --noEmit --watch" } }
```
SWC/esbuild do **not** type-check and reject `const enum` (use `as const`) -- so type-check must run
in CI. In dev, Vite skips type-checking; run it in parallel with `vite-plugin-checker` or
`tsc --watch`.

## Path aliases (keep TS and the bundler in sync)
Define `paths` in tsconfig **and** a matching `resolve.alias` in Vite (or `vite-tsconfig-paths` to
reuse tsconfig's). TS resolves types; the bundler resolves runtime -- if they disagree, prod breaks.
Pick one convention (`@/`) and do not mix.

## Declarations for assets, libs, and env
One `src/types/assets.d.ts` teaches TS about non-JS imports:
```ts
declare module '*.css' { const s: { [k: string]: string }; export default s; }
declare module '*.svg' { const src: string; export default src; }        // *.svg?url for the URL form
```
A pattern can only be declared once -- use `?url`/`?raw` suffixes to differentiate. Augment
`CSSProperties` for CSS variables or `HTMLAttributes` for custom `data-*`. Prefer `import type`.

**Typed env vars:** centralize behind one validated `env.ts` that reads `import.meta.env.VITE_*`,
coerces types (booleans arrive as strings), and throws on a missing required var so misconfig fails
fast. Vite only exposes vars prefixed `VITE_`.
