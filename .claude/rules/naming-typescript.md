# Rules: Naming (TypeScript / React / Next.js)

Follow standard TypeScript and React conventions without exception.

| Element | Convention | Example |
|---------|------------|---------|
| Component | `PascalCase` | `ProductCard`, `SalesChart` |
| Component file | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook | `useCamelCase` | `useProducts`, `useAuth` |
| Variable / function | `camelCase` | `totalRevenue`, `formatPrice` |
| Type / interface | `PascalCase`, no `I` prefix | `Product`, `SalesPoint` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Route folder (App Router) | `kebab-case` | `app/admin-users/` |
| Dynamic segment | `[param]` | `app/post/[id]/page.tsx` |
| Boolean | `is / has / should` prefix | `isLoading`, `hasError` |

## Hard rules

- **No `any`.** Use precise types, `unknown` + narrowing, or generics. `any` throws away
  the one guarantee TypeScript exists to give.
- **One consistent import alias scheme** — `@/components/...`, never a mix of `@/` and
  deep relative `../../../` hops. (Common AI anti-pattern.)
- **No unused imports.** Remove `React`, icons, or images never rendered — they bloat the
  bundle and hide real dependencies. (Common AI anti-pattern.)
- Name derived data by what it is, not how it was made: `sortedProducts`, not `data2`.
- If a name needs a comment to explain it, rename it. Naming difficulty signals a design
  problem — stop and reshape (SRP violation).
- No magic numbers/strings — declare a named `const` (`UPPER_SNAKE_CASE`).
