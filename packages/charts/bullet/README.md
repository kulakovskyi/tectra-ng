# Bullet Chart

`<tx-bullet-chart>` — a value against a target over qualitative ranges (poor / fair / good), one compact row per measure on a shared scale. A dashboard-friendly replacement for a row of gauges. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxBulletChart } from '@tectra-ng/charts/bullet';
```

```html
<tx-bullet-chart [items]="[{ label: 'Revenue', value: 72, target: 85 }]" [ranges]="[50, 80]" [max]="100" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ label, value, target?, ranges?, color? }[]` — one row per measure; an item's `ranges` override the shared ones. An empty list shows "No data" |
| ranges | Thresholds of the qualitative ranges, from low to high: `[50, 80]` gives 0–50, 50–80, 80–max; the first range is the darkest |
| min | Start of the scale (0) |
| max | End of the scale; the biggest value, target or threshold by default |
| height | Height in px; by default one `chart.bullet.rowHeight` per row plus the axis |
| showTooltip | Shows the value and the target on hover and keyboard focus |
| valueFormat | Format of the axis and the tooltip: `number`, `integer`, `compact`, `percent` or a function |
| grid | Grid lines: `value` (default), `category`, `both` or `none` |
| maxLabelWidth | Longer row labels are cut with an ellipsis (180px) |
| toolbar | Shows the chart menu: download SVG, PNG or CSV |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — row height, range shades, bar and target size and colour |
| pt | Classes and styles of the parts: `root`, `hoverBand`, `plot`, `svg`, `grid`, `axis`, `range`, `bar`, `target`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| barClick | A row was clicked: `index`, `label`, `value`, `target` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart |
| ↑ / ↓ (← / →) | Previous / next row; the value and the target are announced, the tooltip follows |
| Home / End | First / last row |
| Escape | Closes the tooltip |

## Notes

Rows share one scale so they compare at a glance; use separate charts for measures in different units. Hovering a row lays a soft band under it and fades the others. Value bars grow once and slide to new values; both are off with reduced motion.
