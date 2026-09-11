# React + TypeScript audit scorecard

For each item, score **present / partial / missing**, note the risk, and fix the highest-risk gaps
first. Details per area live in [playbook/](playbook/).

## Setup & config ([01](playbook/01-setup-and-config.md))
- [ ] `strict: true` (or a documented incremental adoption path)
- [ ] `noEmit` with Vite/SWC compiling; `tsc --noEmit` runs in CI
- [ ] ESLint flat config + Prettier; `rules-of-hooks` on, `prop-types`/`react-in-jsx-scope` off
- [ ] Path aliases matched in tsconfig AND the bundler
- [ ] Asset/module `.d.ts` present; env vars behind one typed, validated module

## Type system ([02](playbook/02-type-system.md))
- [ ] No `any` at boundaries -- `unknown` + a type guard instead
- [ ] State modeled as discriminated unions (not loose booleans), with an exhaustive `never` default
- [ ] Narrowing via guard functions (`.filter(isNotNull)`, not `.filter(x => x !== null)`)
- [ ] Types derived from a source-of-truth model via utility types (no parallel hand-written shapes)
- [ ] Inference used within; annotations at boundaries (props, empty collections, returns)

## Advanced types ([03](playbook/03-advanced-types.md))
- [ ] Generics constrained (`extends`), with defaults; `<T,>` in `.tsx`
- [ ] `satisfies` used to keep literal inference while constraining
- [ ] Public generics/overloads/props covered by type-level tests in CI
- [ ] Compile perf: project references, type-only imports, no barrel `export *` / giant unions

## Components & props ([04](playbook/04-components-and-props.md))
- [ ] Function components with explicit props types (not `React.FC`)
- [ ] Invalid prop combinations uncompilable (discriminated unions / `never`)
- [ ] Native props mirrored via `ComponentPropsWithoutRef`; collisions renamed
- [ ] `children: ReactNode` unless element inspection is needed
- [ ] `forwardRef` + `memo` ordered correctly, each with a `displayName`

## Hooks & state ([05](playbook/05-hooks-and-state.md))
- [ ] `useState`/`useRef` typed (unions, nullable, empty collections); functional updates
- [ ] Generic custom hooks preserve inference; effect cleanup synchronous
- [ ] Context non-nullable + throws outside provider; value memoized; state/actions split
- [ ] Reducer action union with exhaustive `never`; action creators memoized

## Events, forms & styling ([06](playbook/06-events-forms-styling.md))
- [ ] Specific event types; `currentTarget` (not `target`) for values
- [ ] Number/text inputs coerced (strings -> value) with `NaN`/empty handling
- [ ] Styles typed via `CSSProperties`/token keys; Tailwind variants via `cva` + `VariantProps`
- [ ] Route params validated through a schema (no `param!`)

## Data, errors & validation ([07](playbook/07-data-errors-validation.md))
- [ ] External data validated at the boundary with a schema (no `as User`)
- [ ] Failure modeled as `Result`/discriminated union; error boundaries typed
- [ ] `use()` promises memoized (no refetch loop)
- [ ] Untrusted HTML branded + sanitized before `dangerouslySetInnerHTML`

## SSR, libraries & testing ([08](playbook/08-ssr-libraries-testing.md))
- [ ] Server->client props serializable-typed; runtime globals guarded
- [ ] Realtime messages validated with a discriminated-union schema
- [ ] `React.lazy` modules default-exported; lazy trees wrapped in Suspense + boundary
- [ ] Published/monorepo types: intentional exports, project references, semver-aware
- [ ] Tests fully typed and cover runtime gaps (see frontend-unit-testing)

> Runtime performance typing (memo/identity contracts, the React Compiler) lives in
> **react-performance**; typed-test mechanics live in **frontend-unit-testing**.
