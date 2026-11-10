# Column Chart

`<tx-column-chart>` — columns or horizontal bars for comparing values across categories: stacked, 100% stacked or grouped. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxColumnChart } from '@tectra-ng/charts/column';
```

```html
<tx-column-chart [series]="series" [categories]="weekdays" stackType="100%" />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, data, color? }[]` — one number (or `null`) per category. An empty list shows "No data" |
| categories | Labels of the category axis, one per value |
| stacked | Stacks the series (default); `false` groups them side by side |
| stackType | `normal` or `100%` (every category to 100%; also turns stacking on) |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| horizontal | Draws horizontal bars with the categories on the left |
| dataLabels | Writes each value on its bar (inside when it fits) |
| showLegend | Shows the legend; a single series never has one |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `dot` (default), `line`, `pill` or `stat` (series totals, or the hovered column's values, in large type; it replaces the tooltip) |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| tooltipMode | `shared` (every series of the category) or `single` |
| tooltipFormatter | `(value, { seriesIndex, dataPointIndex }) => string` for tooltip and data label values; default — the locale number format |
| valueFormat | Value axis format: `number`, `integer`, `compact`, `percent` or a function |
| yScale | `linear` or `log` |
| yMin | Fixed start of the value axis |
| yMax | Fixed end of the value axis |
| xAxisTitle | Title of the category axis |
| yAxisTitle | Title of the value axis |
| grid | Grid lines: `value`, `category`, `both` or `none` |
| xAxisPosition | Side of the horizontal axis: `bottom` or `top` |
| yAxisPosition | Side of the vertical axis: `left` or `right` |
| labelMode | Category labels that do not fit: `auto`, `rotate` or `skip` |
| maxLabelWidth | Longer category labels are cut with an ellipsis (220px) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — bar radius, width and gap, palette, labels |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `bar`, `dataLabel`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| barClick | A bar was clicked: `seriesIndex`, `dataPointIndex`, `value`, `category` |
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
| ← / → | Previous / next category (↑ / ↓ when `horizontal`); announced, the tooltip follows |
| ↑ / ↓ | Previous / next series in the category (← / → when `horizontal`) |
| Home / End | First / last category |
| Escape | Closes the tooltip |

## Notes

Hovering a column (not the empty space around it) highlights it, fades the others and pins the tooltip above it with an arrow; a stack also shows its total. Only the outer end of a stack is rounded and the segments are split by a thin card-coloured gap. Bars grow from the zero line once when the chart appears and slide to new values on change; both are off with reduced motion. The bar width, the gap between grouped bars and the radius come from the `chart.bar` tokens.
