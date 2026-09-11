---
name: react-typescript
description: Types React + TypeScript code correctly and idiomatically -- components, props, hooks, events, generics, utility types, discriminated unions, context, and tsconfig. Use when typing or reviewing a React component/hook, choosing between type patterns (unions, generics, polymorphic props), fixing TS errors, validating external data, setting up tsconfig/ESLint, or migrating JS/PropTypes to TypeScript.
---

# React + TypeScript

Types are **compile-time design docs** that vanish at runtime. Two ideas carry most of the value:
make invalid states unrepresentable, and validate anything crossing a runtime boundary. Everything
else is applying those to React's surfaces.

## Two rules that prevent most bugs
1. **Model state as a discriminated union, not loose booleans.** `loading + error` can both be true;
   `{ status: 'loading' } | { status: 'error'; error: Error }` cannot.
2. **Types are erased at runtime -- `as User` is a lie.** Validate external data (fetch, params,
   storage, messages) with a schema (Zod) at the boundary, then pass typed data down without
   re-validating.

## Step 0 -- Detect, then pick a mode
Inspect: React version (18/19), `tsconfig` strictness, bundler (Vite/Next), whether the React
Compiler is on, and where the friction is (props, hooks, events, data, or a specific TS error).

- **Bootstrap** -- new project/area: set up strict tsconfig + ESLint, then type the surfaces.
- **Audit** -- score existing code against [CHECKLIST.md](CHECKLIST.md) and fix the highest-risk gaps.

## The playbook
1. **Setup & config** -- strict tsconfig, ESLint, tsc-vs-SWC, path aliases, asset/env declarations. See [playbook/01-setup-and-config.md](playbook/01-setup-and-config.md).
2. **Type system** -- structural typing, `unknown` over `any`, unions/guards, discriminated unions, narrowing, inference, utility types. See [playbook/02-type-system.md](playbook/02-type-system.md).
3. **Advanced types** -- generics, conditional/mapped/template-literal types, overloads, `satisfies`, type-level testing, compile perf. See [playbook/03-advanced-types.md](playbook/03-advanced-types.md).
4. **Components & props** -- prop unions, polymorphic `as`, compound/slots, mirroring DOM props, `ReactNode` vs `ReactElement`, `forwardRef`/`memo`, HOCs vs render props. See [playbook/04-components-and-props.md](playbook/04-components-and-props.md).
5. **Hooks & state** -- typing `useState`/`useRef`/reducers, generic custom hooks, typed context + a safer `createContext`, state libraries. See [playbook/05-hooks-and-state.md](playbook/05-hooks-and-state.md).
6. **Events, forms & styling** -- DOM/React events, number inputs, form actions, `useOptimistic`, ARIA typing, `CSSProperties`, typed Tailwind variants, typed routes. See [playbook/06-events-forms-styling.md](playbook/06-events-forms-styling.md).
7. **Data, errors & validation** -- runtime validation, `Result` types, error boundaries, React Query/tRPC typing, branded security types, JS/PropTypes migration. See [playbook/07-data-errors-validation.md](playbook/07-data-errors-validation.md).
8. **SSR, libraries & testing** -- RSC/server-action types, streaming/edge types, realtime typing, React Compiler, publishing library types, monorepos, typed tests. See [playbook/08-ssr-libraries-testing.md](playbook/08-ssr-libraries-testing.md).

## Golden rules
- Prefer `unknown` + a type guard at every boundary; every `any` is a latent runtime crash.
- Derive types from one source-of-truth model (utility types) instead of hand-writing parallel shapes.
- Infer within implementations; annotate at boundaries (params, props, empty collections, returns).
- Prefer function declarations with an explicit props type over `React.FC` (implicit children, worse inference).

## Tooling policy
- **Local-first (use freely):** everything compile-time -- tsconfig, ESLint, the type patterns here,
  and runtime validators (Zod), branded types, typed test helpers.
- **GATED (needs infra):** RSC/streaming-SSR/edge, tRPC backends, module federation, monorepo build
  wiring, and publishing pipelines. The **type contracts are portable**; only their wiring needs the setup.

For runtime performance typing (memo/identity contracts, the React Compiler) see **react-performance**;
for the mechanics of typed tests see **frontend-unit-testing**.

Templates: [templates/tsconfig.json](templates/tsconfig.json), [templates/type-helpers.ts](templates/type-helpers.ts).
