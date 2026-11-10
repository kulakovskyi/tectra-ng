# Heatmap

`<tx-heatmap>` — a grid of rows × columns, the columns grouped in bands (days by week, hours by day, months by year). Each cell is coloured by a tone or by its value on a colour scale. The header row, the row headers and the value column stay in place while the grid scrolls both ways inside `maxHeight`; cells have a tooltip and an accessible name, interactive cells are buttons. `heatmapCalendar()` turns dated values into a year (or any range) of days.

```ts
import { TxHeatmap, TxHeatmapRowHeader, TxHeatmapRowValue, heatmapCalendar } from '@tectra-ng/charts/heatmap';
```

```html
<tx-heatmap [groups]="groups" [rows]="rows" [legend]="legend" (cellClick)="open($event)" />
```

## Inputs
| Name | Description |
|---|---|
| groups | `{ key, label, columns: { key, label }[] }[]` — column bands in order |
| rows | `{ key, label?, cells, data? }[]` — `cells` follow the columns of all groups in order; a cell is `{ tone?, value?, tooltip?, ariaLabel?, interactive?, hidden?, data? }` or `null` for an empty slot |
| legend | `{ label, tone?, value? }[]` under the grid; a "No data" item for empty cells is added at the end |
| labels | `{ rowHeader, valueHeader, empty, region }` — texts of the header cells, the empty legend item and the scroll region name |
| maxHeight | Height after which the grid scrolls; default — the `chart.heatmap.maxHeight` token (364px) |
| scaleSteps | Number of colour steps for cells with a `value` (5) |
| scaleMin | Value drawn as empty and the start of the scale; default — the smallest value or 0 |
| scaleMax | Value with the full colour; default — the biggest value |
| dt | Design tokens of this heatmap (`chart`, group `heatmap`) — cell size, column widths (`leadWidth`, `valueWidth`), tone colours, scale colour |
| pt | Classes and styles of the parts: `root`, `scroll`, `grid`, `head`, `row`, `lead`, `groups`, `group`, `groupLabel`, `columns`, `column`, `value`, `cell`, `legend` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

Tones: `success`, `danger`, `warn`, `info` (striped), `pending` (outlined), `neutral`. A cell with a `value` and no `tone` takes the scale colour.

## Outputs
| Name | Description |
|---|---|
| cellClick | An interactive cell was clicked or pressed with Enter / Space: `row`, `cell`, `columnKey` |

## Slots
| Name | Description |
|---|---|
| txHeatmapRowHeader | `<ng-template txHeatmapRowHeader let-row>` — the sticky row header (default: `row.label` or `row.key`) |
| txHeatmapRowValue | `<ng-template txHeatmapRowValue let-row>` — the sticky value column at the end of each row |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the scroll region, then each interactive cell |
| Arrow keys | Scroll the focused region |
| Enter / Space | Activates the focused cell (`cellClick`) |
