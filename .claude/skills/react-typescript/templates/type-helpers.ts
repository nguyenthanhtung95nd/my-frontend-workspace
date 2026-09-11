// Reusable React + TypeScript helpers. Copy what you need; all compile-time / local-first.
import { createContext, useContext, type Provider } from 'react';

// 1. Safer context: non-nullable, throws a clear error outside its provider.
export function createSafeContext<T>(name: string): readonly [() => T, Provider<T | null>] {
  const Ctx = createContext<T | null>(null);
  Ctx.displayName = name;
  function useSafeContext(): T {
    const value = useContext(Ctx);
    if (value === null) throw new Error(`use${name} must be used within a ${name}Provider`);
    return value;
  }
  return [useSafeContext, Ctx.Provider] as const;
}

// 2. Branded (nominal) types -- distinguish otherwise-identical strings.
export type Brand<T, B extends string> = T & { readonly __brand: B };
export type UserId = Brand<string, 'UserId'>;
export type TrustedHtml = Brand<string, 'TrustedHtml'>;

// 3. Result type -- model failure as a value, not an exception.
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// 4. Mirror a native element's props (extend, do not re-declare).
export type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary';
};

// 5. Exhaustiveness helper -- call in a switch default to catch unhandled union variants.
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}

// 6. Typed, validated env access -- fails fast on a missing required var.
interface AppEnv {
  API_BASE_URL: string;
  ENABLE_ANALYTICS: boolean;
}
function readEnv(key: string, fallback?: string): string {
  const value = import.meta.env[`VITE_${key}`] as string | undefined;
  if (value === undefined && fallback === undefined) {
    throw new Error(`Missing required env var VITE_${key}`);
  }
  return value ?? fallback!;
}
export const env: AppEnv = {
  API_BASE_URL: readEnv('API_BASE_URL'),
  ENABLE_ANALYTICS: readEnv('ENABLE_ANALYTICS', 'false') === 'true',
};
