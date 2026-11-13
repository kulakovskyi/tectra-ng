# Treemap

`<tx-treemap>` — shares of a total as nested rectangles: each item is a tile with an area proportional to its value (squarified layout), the name and the formatted value drawn inside, cut with an ellipsis when the tile is narrow; `txTreemapTile` draws your own tile content. Items with `children` become a labelled group with their own tiles. Zero values are dropped; no positive value shows "No data".

```ts
import { TxTreemap } from '@tectra-ng/charts/treemap';
```

```html
<tx-treemap [items]="[{ label: 'Hosting', value: 1840 }, { label: 'Ads', value: 920 }]" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ label, value?, color?, children? }[]` — tiles, or groups with `children` (a group's value is the sum of its children) |
| height | Height: px (350) or `'100%'` of a parent with a definite height |
| showDataLabels | Writes the name inside each tile that has room for it (long names end with an ellipsis) |
| showValues | Writes the formatted value under the name when it fits |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| tooltipFormatter | `(value, { seriesIndex, dataPointIndex }) => string` for the tooltip value |
| valueFormat | Format of values: `number`, `integer`, `compact`, `percent` or a function |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the treemap shows; starts the summary read by screen readers |
| dt | Design tokens of this treemap (`chart`, group `treemap`) |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `tile`, `tileContent`, `tileLabel`, `tileValue`, `group`, `groupLabel`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| tileClick | A tile was clicked: `index`, `path` (indexes from the top level), `label`, `group`, `value`, `share` (0–1) |

## Slots
| Name | Description |
|---|---|
| txTreemapTile | `<ng-template txTreemapTile let-tile>` — own content of every tile; context `label`, `value` (formatted), `share`, `color`, `width`, `height`, clipped to the tile |
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the treemap |
| ← / → or ↑ / ↓ | Previous / next tile; announced with its value and share, the tooltip follows |
| Home / End | First / last tile |
| Escape | Hides the tooltip |
