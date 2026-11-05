# Skeleton

A grey placeholder in the shape of content that is still loading — a line, a box, a circle, a paragraph or a whole table. Hidden from screen readers; put `aria-busy="true"` on the region that is loading.

```html
<tx-skeleton shape="circle" size="48px" />
<tx-skeleton [lines]="3" />
<tx-skeleton-table [rows]="6" [columns]="4" />
```

## Inputs
| Name | Description |
|---|---|
| shape | `rectangle` or `circle` |
| size | Width and height at once, e.g. `48px` |
| width | Width, e.g. `60%` |
| height | Height, e.g. `120px` |
| borderRadius | Own corner radius |
| lines | Draws this many text lines, the last one shorter |
| animation | `wave` or `none` (off with reduced motion) |
| rows | `tx-skeleton-table`: number of rows |
| columns | `tx-skeleton-table`: number of columns |
| header | `tx-skeleton-table`: draws a header row |
| dt | Design tokens of this instance (`skeleton`) |
| pt | Classes and styles of the parts: `root`, `line`; table: `root`, `header`, `row`, `cell` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
