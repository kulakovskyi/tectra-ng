# Breakpoint

Screen size as signals: `isMobile` (up to 640px) and `isTablet` (up to 768px) — the breakpoints of the kit layouts — and `matches(query)` for any media query. One listener per query for the whole app; `false` on the server.

```ts
readonly breakpoints = inject(TxBreakpoints);
```

```html
@if (breakpoints.isMobile()) { <tx-drawer …/> } @else { <aside …></aside> }
```

## Methods
| Name | Description |
|---|---|
| isMobile | Signal: the viewport is at most 640px wide |
| isTablet | Signal: the viewport is at most 768px wide |
| matches(query) | Signal of any media query, e.g. `(prefers-reduced-motion: reduce)`; the same signal for the same query |

## Constants
| Name | Description |
|---|---|
| TX_BREAKPOINT_MOBILE / TX_BREAKPOINT_TABLET | `(max-width: 640px)`, `(max-width: 768px)` |
