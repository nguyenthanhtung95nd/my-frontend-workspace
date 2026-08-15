---
allowed-tools: Read(*), Bash(git diff*)
description: Analyze test coverage gaps for changed frontend files. Reports which components/hooks are missing tests for key states. Use before every PR to ensure nothing ships untested.
---

# Test Coverage Gap Analysis

Reports coverage gaps for `.tsx` / `.ts` files changed since the last commit.
Does **not** generate tests — the `test-generator` agent writes missing tests.

## Instructions

1. Run `git diff HEAD --name-only` to get changed files.
2. Filter to source files only — exclude `*.test.tsx`, `*.spec.ts`, `*.e2e.ts`.
3. For each component/hook, find its test file (`{Name}.test.tsx`, `{Name}.spec.ts`).
4. Check whether tests cover each key state/path below.

## Coverage Paths to Check

| Path | What to look for |
|------|-----------------|
| Happy path | Renders with valid data; primary interaction works (query by role) |
| Loading | Skeleton/indicator asserted while fetching |
| Empty | Empty-state rendering with no data |
| Error | Error state when the request fails (MSW 500) |
| Edge/validation | Boundary inputs, form validation, disabled/forbidden actions |
| RBAC (flows) | Non-admin blocked from admin actions (Playwright) |

## Report Format

```
## Test Coverage Report

### {Name}.tsx
| State | Happy | Loading | Empty | Error | Edge | Test File |
|-------|-------|---------|-------|-------|------|-----------|
| ProductGrid | ✅ | ✅ | ❌ | ❌ | N/A | found |
| useProducts | ✅ | ✅ | ✅ | ❌ | ✅ | found |
| CheckoutForm | ❌ | ❌ | N/A | ❌ | ❌ | not found |

**Gaps:**
- `ProductGrid` — missing empty and error state tests
- `CheckoutForm` — no test file → have the `test-generator` agent cover it
```

If all changed components/hooks are fully covered: `✅ All changed frontend units have test coverage.`

## Notes

- Skip pure presentational components with no logic/state, and generated types.
- N/A = that state doesn't apply to this unit.
- If no test file exists at all, flag the entire unit as uncovered.
