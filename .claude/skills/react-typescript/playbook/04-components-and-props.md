# 04 - Components and props

Props are a component's public API -- type them so the happy path is obvious and misuse is a compile
error. Prefer a function declaration with an explicit props type over `React.FC` (it adds implicit
children and weakens inference).

## Props: the essentials
```tsx
interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary';       // string-literal union, not `string`
  onSubmit: (query: string) => Promise<void>;
}
function Button({ variant = 'primary', ...rest }: ButtonProps) { /* defaults in the signature */ }
```
Defaults go in destructuring (not `defaultProps`). Avoid conflicting boolean flags
(`isLoading`/`isError`/`isSuccess`) -- use a status union instead.

## Prop unions -- make invalid combinations uncompilable
Use `never` to make mutually exclusive props exclusive, and discriminated unions for per-variant props.
```tsx
type Props =
  | { variant: 'link'; href: string }
  | { variant: 'button'; onClick: () => void };
// narrow: switch (props.variant) { case 'link': props.href ... }

// mutually exclusive controlled/uncontrolled:
type Toggle = { open: boolean; onOpenChange: (o: boolean) => void; defaultOpen?: never }
            | { defaultOpen?: boolean; open?: never; onOpenChange?: never };
```

## Polymorphic components (the `as` prop)
One component, element-correct typing:
```tsx
type Props<T extends React.ElementType> = { as?: T; variant?: string }
  & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'variant'>;
function Box<T extends React.ElementType = 'div'>({ as, ...props }: Props<T>) {
  const Component = as ?? 'div';
  return <Component {...props} />;
}
```
Forwarding a ref needs `ComponentPropsWithRef<T>['ref']` and a cast; very complex polymorphic types
slow the compiler.

## Mirroring DOM props
Extend the native element's prop type instead of re-declaring attributes (which drift and lose
autocomplete):
```tsx
interface InputProps extends React.ComponentPropsWithoutRef<'input'> { label: string; }
// override a native prop:
type X = Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> & { onClick: (id: string) => void };
```
Rename custom/native collisions (`inputSize`). `AllHTMLAttributes` permits invalid-for-element attrs
-- avoid it.

## Children: ReactNode vs ReactElement
`ReactNode` (~95% of the time) accepts strings, numbers, arrays, `null`, elements. Use `ReactElement`
only when you must `cloneElement` or inspect props; `JSX.Element` loses generics and rejects `null`.
```tsx
function Card({ children }: { children: React.ReactNode }) { /* ... */ }
```
For a component that can return `null`, annotate the return as `ReactNode`.

## forwardRef, memo, displayName
```tsx
const Base = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => <input ref={ref} {...props} />);
Base.displayName = 'Input';                 // else DevTools shows Anonymous
export const Input = React.memo(Base);
```
Order matters: `memo(forwardRef(...))` (forwardRef innermost); `forwardRef(memo(...))` drops ref
forwarding. `memo` is useless if props change identity every render -- pair with `useCallback`. A
generic + `forwardRef` needs a cast to preserve the type parameter.

## HOCs vs render props vs hooks
`ComponentType<P>` is the base type for anything accepting a component. Type HOCs with generics so
wrapped props survive:
```tsx
function withLoading<T extends object>(C: React.ComponentType<T>): React.ComponentType<T & { loading: boolean }> { /* ... */ }
```
In new code prefer a **custom hook** (transparent types) or a **render prop**
(`children: (state: S) => React.ReactNode`) over an HOC -- HOCs fight TypeScript. Keep HOCs for class
or third-party wrapping.
