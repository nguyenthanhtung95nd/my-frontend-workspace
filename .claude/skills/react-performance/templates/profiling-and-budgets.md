# Templates: profiling and budgets

Copy-paste starters for measuring and gating React performance. All local-first except where noted.

## 1. Profile a render in code
Wrap a suspect subtree in `<Profiler>` to log actual/base render durations. Remove before shipping.

```tsx
import { Profiler, type ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  if (actualDuration > 16) console.warn(`[perf] ${id} ${phase} took ${actualDuration.toFixed(1)}ms`);
};

<Profiler id="TaskList" onRender={onRender}>
  <TaskList tasks={tasks} />
</Profiler>;
```

## 2. "Why did this render?" hook
Log which props changed identity between renders -- catches recreated inline objects/functions.

```ts
import { useEffect, useRef } from 'react';

export function useWhyDidYouRender(name: string, props: Record<string, unknown>) {
  const prev = useRef(props);
  useEffect(() => {
    const changed = Object.keys(props).filter((k) => prev.current[k] !== props[k]);
    if (changed.length) console.log(`[why-render] ${name}:`, changed);
    prev.current = props;
  });
}
```

## 3. Bundle-size budget (pre-push + CI)
Gate gzipped size so a heavy dependency cannot land unnoticed. Set limits from a real baseline.

```jsonc
// package.json
{
  "scripts": { "size": "size-limit" },
  "size-limit": [
    { "path": "dist/assets/index.*.js", "limit": "110 kB" },
    { "path": "dist/assets/react.*.js", "limit": "55 kB" }
  ]
}
```
Wire `npm run size` into a pre-push hook and CI; fail on breach. Read the gzip number -- it
approximates the network cost.

## 4. Render-time unit matcher (pairs with frontend-unit-testing)
Assert a component renders within budget for a realistic dataset.

```ts
import { Profiler } from 'react';
import { render } from '@testing-library/react';

export function measureRenderMs(ui: React.ReactElement): number {
  let ms = 0;
  render(<Profiler id="t" onRender={(_, __, actual) => (ms = actual)}>{ui}</Profiler>);
  return ms;
}

// it('renders 1000 rows within budget', () => {
//   expect(measureRenderMs(<Grid rows={makeRows(1000)} />)).toBeLessThan(50);
// });
```

## 5. Core Web Vitals field reporting (GATED: needs a RUM backend)
```ts
import { onLCP, onINP, onCLS } from 'web-vitals';
const send = (m: unknown) => navigator.sendBeacon('/rum', JSON.stringify(m));
onLCP(send); onINP(send, { reportAllChanges: true }); onCLS(send);
```
Sample (~10%), segment by route/device/network, and track p75/p95/p99. Confirm the endpoint is
org-approved before enabling.
