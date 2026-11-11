# Line Chart

`<tx-line-chart>` — a smooth area or line chart for trends over time, drawn as SVG by the component (no chart library). It renders on the server, takes its colours, fonts and sizes from the design tokens and follows the kit's locale.

```ts
import { TxLineChart } from '@tectra-ng/charts/line';
```

```html
<tx-line-chart [series]="series" [categories]="months" [height]="320" ariaLabel="Visits by month" />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, data, color? }[]`. `data` holds one number (or `null` for a gap) per category, or `{ x, y }` points. An empty list or only `null` values show "No data" |
| categories | X labels, one per value. Empty = the 12 month names of the active locale. With `xType="time"` these are dates |
| xType | `category` (labels at even steps), `time` (dates with real gaps, calendar ticks) or `linear` (numbers) |
| height | Height in px (450), or a CSS size such as `'100%'` of a parent with a definite height |
| curve | `smooth` (monotone, never overshoots), `straight` or `step` |
| area | Fills the area under each line with a fading gradient of its colour |
| stacked | Stacks the series on top of each other |
| stackType | `normal` or `100%` (each point as a share of the total; also turns stacking on) |
| markers | Draws a dot on every value (left out when the points are too dense) |
| showLegend | Shows the legend; a single series never has one |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `line` (default), `dot`, `pill` or `stat` (each series' value under the pointer, or the last one, in large type; it replaces the tooltip) |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| tooltipMode | `shared` (every series at the point) or `single` (the nearest series) |
| tooltipFormatter | `(value, { seriesIndex, dataPointIndex }) => string` for tooltip values; default — whole numbers in the locale |
| valueFormat | Value axis format: `number`, `integer`, `compact`, `percent` or a function |
| yScale | `linear` or `log` |
| yMin | Fixed bottom of the value axis |
| yMax | Fixed top of the value axis |
| xAxisTitle | Title under the x axis |
| yAxisTitle | Title beside the value axis |
| grid | Grid lines: `value`, `category`, `both` or `none` |
| xAxisPosition | Side of the horizontal axis: `bottom` or `top` |
| yAxisPosition | Side of the vertical axis: `left` or `right` |
| labelMode | X labels that do not fit: `auto`, `rotate` or `skip` |
| maxLabels | At most this many x labels (10) |
| decimation | Thins long series with the largest-triangle method before drawing |
| toolbar | Shows the chart menu in the top right corner: download SVG, PNG or CSV (the file is named after `ariaLabel`); a row is kept for it when the legend is not on top |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `series`, `line`, `area`, `marker`, `crosshair`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| pointClick | A value was clicked: `seriesIndex`, `dataPointIndex`, `value`, `category` |
| seriesToggle | A legend item hid or showed a series: `seriesIndex`, `name`, `hidden` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content; `data` has `title` and `rows` (`label`, `value`, `color`, `raw`, `seriesIndex`) |
| txChartLegend | `<ng-template txChartLegend let-item>` — own legend item; `item` has `label`, `color`, `hidden` |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart, then the legend items |
| ← / → | Previous / next value; the value is announced and the tooltip follows |
| ↑ / ↓ | Previous / next visible series |
| Home / End | First / last value |
| Escape | Closes the tooltip |
| ← / → in the legend | Moves between legend items; Enter or Space toggles the series |

## Notes

On hover a vertical rule marks the nearest value, every series gets a ringed point on it, and the tooltip follows the mouse beside the cursor; with the keyboard or a tap it is pinned above the rule with an arrow (in `single` mode — above the point); stacked charts add the total. The server renders the chart at a fixed width with the same markup the browser hydrates; the real width is measured after hydration and the chart redraws inside the same box, so nothing on the page moves. New inputs redraw in place and the lines morph to the new values. Colours of hidden series stay with their series.
