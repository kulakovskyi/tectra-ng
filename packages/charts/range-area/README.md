# Range Area Chart

`<tx-range-area-chart>` — a band from a low to a high value with an optional line inside: daily temperature from min to max with the average, a forecast with its confidence range, prices with their spread. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxRangeAreaChart } from '@tectra-ng/charts/range-area';
```

```html
<tx-range-area-chart [series]="[{ name: 'Temperature', low: [2, 4, 3], high: [9, 11, 10], line: [6, 7, 6] }]" [categories]="['Mon', 'Tue', 'Wed']" />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, low, high, line?, color? }[]` — one value per category in each array; a `null` leaves a gap. An empty list shows "No data" |
| categories | Labels of the x axis, or dates with `xType="time"` |
| xType | `category` (default) or `time` (dates at their real distance) |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| curve | Shape of the band and the line: `smooth` (default), `straight` or `step` |
| edges | Draws the low and high edges of the band (on by default) |
| showLegend | Shows the legend; a single series never has one |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `line` (default), `dot` or `pill` |
| showTooltip | Shows the line value and the range of every series on hover and keyboard focus |
| valueFormat | Value axis and tooltip format: `number`, `integer`, `compact`, `percent` or a function |
| yMin | Fixed start of the value axis |
| yMax | Fixed end of the value axis |
| xAxisTitle | Title of the x axis |
| yAxisTitle | Title of the value axis |
| grid | Grid lines: `value`, `category`, `both` or `none` |
| labelMode | Labels that do not fit: `auto`, `rotate` or `skip` |
| maxLabels | Most x labels to show (10) |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — band opacity, edge and line widths, palette |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `series`, `band`, `edge`, `line`, `marker`, `crosshair`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| pointClick | A category was clicked: `seriesIndex` (the band under the pointer or the nearest), `dataPointIndex`, `category`, `low`, `high`, `line` |
| seriesToggle | A legend item hid or showed a series: `seriesIndex`, `name`, `hidden` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |
| txChartLegend | `<ng-template txChartLegend let-item>` — own legend item |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart, then the legend items |
| ← / → | Previous / next category; announced, the tooltip follows |
| ↑ / ↓ | Previous / next series |
| Home / End | First / last category |
| Escape | Closes the tooltip |

## Notes

The tooltip shows the line value with the range beside it, or the range alone. A crosshair and markers on the line and both edges follow the pointer. Bands draw in from the left once and morph to new values; both are off with reduced motion.
