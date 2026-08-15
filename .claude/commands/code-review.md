---
allowed-tools: Read(*), Bash(*)
description: Review all changed frontend files for bugs, AI anti-patterns, accessibility, and performance. Runs on git diff. Use before every PR. For security review use /security-review.
---

# Code Review — Bugs, Anti-Patterns & Performance

Reviews files changed since the last commit for correctness, AI-generated code smells,
accessibility, and performance.

## Instructions

1. Run `git diff HEAD` to identify changed `.tsx` / `.ts` / config files.
2. Read each changed file in full — do not review diffs in isolation.
3. Apply `@.claude/rules/` and the `skills/nextjs-patterns/` references throughout.
4. For each issue: file path, line number, severity, recommended fix.

## Review Scope

### Bugs & correctness
- Missing loading / empty / error states on data-driven UI
- Mutation during render (`.sort()` on props/state) — use `toSorted()`
- Wrong Server/Client boundary; hydration mismatches (`Date`, locale, `toFixed` money)
- Unhandled promise rejections; missing effect cleanup / stale dependency arrays
- Off-by-one, incorrect conditions, unguarded `undefined`/`null`

### AI anti-patterns (see `AI-ANTI-PATTERNS.md`)
- Redundant `useState`; raw `useEffect` fetching (no cache); unthrottled listeners
- Raw `<img>` vs `next/image`; unused imports; inconsistent aliases; one-file dumping

### Accessibility & performance
- Missing `alt`/roles/labels; non-semantic markup; keyboard gaps
- Core Web Vitals risks (LCP/CLS), unmemoized recompute, client boundary too high

### Maintainability
- `any`, disabled checks (`ignoreBuildErrors`, `@ts-ignore`), folder-hygiene violations

## Report Format

```
## Code Review Summary
Brief overview of changes and overall assessment.

## Findings
### [SEVERITY] Short title — `path/to/file.tsx:line`
**Issue:** What is wrong and why it matters.
**Fix:** Concrete recommendation with code example if needed.
```

Severity: `Critical` | `High` | `Medium` | `Low` | `Info`. Omit empty sections.
If no findings at all: `✅ No bugs, anti-patterns, or performance issues found.`
