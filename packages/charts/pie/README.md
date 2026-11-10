# Pie Chart

`<tx-pie-chart>` — a donut or pie for parts of a whole: the total in the centre, the hovered segment there on hover, percent labels on the segments, a legend below or beside with values and shares. Drawn as SVG, rendered on the server and themed by the design tokens. The `txPieLegend` pipe and `pieLegend()` give the same rows and colours for your own legend.

```ts
import { TxPieChart, TxPieLegendPipe } from '@tectra-ng/charts/pie';
```

```html
<tx-pie-chart [pieData]="{ series: [12, 5], labels: ['Active', 'Paused'] }" totalLabel="Total" />
```

## Inputs
| Name | Description |
|---|---|
| pieData | Required. `{ series, labels, colors? }` — values, one label per value and optional own colours. No values or only zeros show "No data" |
| chartWidth | Width: px (200) or a CSS size |
| chartHeight | Height: px (400) or a CSS size; the donut takes the width and the legend goes under it |
| showLegend | Shows the legend |
| legendPosition | `bottom` (default), `top`, `left` or `right` |
| legendAlign | `center` (default), `start` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `dot` (default), `line`, `pill` or `stat` (each value in large type with its share; it replaces the tooltip) |
| legendValues | Lists the value and the share of each segment in the legend |
| showDataLabels | Writes the share on each segment (one decimal); slices under 10° get none |
| totalLabel | Non-empty = the total is always in the centre with this caption |
| totalFormatter | `(value) => string` for the centre total and the hovered value |
| tooltipFormatter | `(value, { seriesIndex }) => string` for the tooltip value |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| valueFormat | Format of values: `number`, `integer`, `compact`, `percent` or a function |
| donutSize | Size of the hole as a share of the radius (`'65%'`); `'0%'` draws a pie |
| segmentGap | Width in px of the card-coloured gap between segments (2) |
| segmentRadius | Rounding of the segment corners in px; default — the `chart.pie.segmentRadius` token (4px). It shrinks on narrow segments and thin rings so the shape never breaks; `0` keeps sharp corners |
| startAngle | Where the first segment starts, degrees clockwise from the top (0) |
| endAngle | Where the last one ends (360); `-90` to `90` is a half donut |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `segment`, `dataLabel`, `center`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| segmentClick | A segment was clicked: `index`, `label`, `value`, `percent` |
| segmentToggle | A legend item hid or showed a segment: `index`, `label`, `hidden` |

## Slots
| Name | Description |
|---|---|
| txPieCenter | `<ng-template txPieCenter let-center>` — own centre content; `center` has `label`, `value`, `raw`, `total`, `hovered`, `index`, `color` |
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |
| txChartLegend | `<ng-template txChartLegend let-item>` — own legend item (`label`, `color`, `hidden`, `value`, `percent`) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart, then the legend items |
| ← / → or ↑ / ↓ | Previous / next segment; announced with its value and share, the tooltip follows |
| Home / End | First / last segment |
| Escape | Closes the tooltip |

## Notes

A hovered segment moves out a little, the others fade, the centre shows its value and name, and the tooltip sits at the segment's outer edge with an arrow, on the side the segment faces. `pieLegend(data)` / `data | txPieLegend` return `{ label, value, percent, color }` in series order; `percent` is 0–100 and not rounded, `color` is the CSS variable of the palette slot (it follows the theme). Segments turn in once when the chart appears and morph to new values on change; both are off with reduced motion.
