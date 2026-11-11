# Combo Chart

`<tx-combo-chart>` — columns and lines (or areas) in one plot, each series on the main or a second value axis: revenue in columns with a margin line in percent, visits with a conversion rate. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxComboChart } from '@tectra-ng/charts/combo';
```

```html
<tx-combo-chart
  [series]="[
    { name: 'Revenue', data: [40, 52, 61] },
    { name: 'Margin', data: [18, 22, 25], type: 'line', axis: 'secondary' },
  ]"
  [categories]="['Jan', 'Feb', 'Mar']"
  y2ValueFormat="percent"
/>
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, data, color?, type?, axis? }[]` — one number (or `null`) per category; `type` is `column` (default), `line` or `area`, `axis` is `primary` (default) or `secondary`. An empty list shows "No data" |
| categories | Labels of the category axis, one per value |
| annotations | Marks on the plot: `{ type: 'x-line', x }`, `{ type: 'y-line', y }`, `{ type: 'x-band', from, to }`, `{ type: 'y-band', from, to }`, `{ type: 'point', x, y }`, each with an optional `label`, `tone` (`neutral`, `primary`, `success`, `info`, `warn`, `danger`) or `color`; `x` is a category label or index; `axis: 'secondary'` puts a `y-line`, `y-band` or `point` on the second value axis |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| stacked | Stacks the column series of each axis; by default they stand side by side |
| curve | Shape of the lines: `smooth` (default), `straight` or `step` |
| markers | Draws a point on every line value (on by default; dropped when the points are too dense) |
| showLegend | Shows the legend; a single series never has one. Line series get a line marker, columns a dot |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `dot` (default), `line`, `pill` or `stat` (column totals and the last line value, or the hovered category, in large type; it replaces the tooltip) |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| tooltipMode | `shared` (every series of the category) or `single` |
| tooltipFormatter | `(value, { seriesIndex, dataPointIndex }) => string` for tooltip values; default — the format of the series' axis |
| valueFormat | Format of the main value axis: `number`, `integer`, `compact`, `percent` or a function |
| y2ValueFormat | Format of the second value axis; the main one by default |
| yScale | `linear` or `log` for the main value axis |
| yMin | Fixed start of the main value axis |
| yMax | Fixed end of the main value axis |
| y2Min | Fixed start of the second value axis |
| y2Max | Fixed end of the second value axis |
| xAxisTitle | Title of the category axis |
| yAxisTitle | Title of the main value axis |
| y2AxisTitle | Title of the second value axis |
| grid | Grid lines: `value`, `category`, `both` or `none` |
| xAxisPosition | Side of the category axis: `bottom` or `top` |
| yAxisPosition | Side of the main value axis: `left` or `right`; the second axis takes the other side |
| labelMode | Category labels that do not fit: `auto`, `rotate` or `skip` |
| maxLabelWidth | Longer category labels are cut with an ellipsis (220px) |
| toolbar | Shows the chart menu in the top right corner: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — bar radius, width and gap, line width, markers, palette |
| pt | Classes and styles of the parts: `root`, `hoverBand`, `annotation`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `bar`, `series`, `line`, `area`, `marker`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| pointClick | A category was clicked: `seriesIndex` (the bar under the pointer or the nearest line), `dataPointIndex`, `value`, `category` |
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
| ↑ / ↓ | Previous / next series in the category |
| Home / End | First / last category |
| Escape | Closes the tooltip |

## Notes

The ticks of the second axis stand on the grid lines of the main one, and zero sits on one line for both, so there is one grid and no double lines; with `y2Min` / `y2Max` the second axis keeps its own ticks. Hovering anywhere in a category lays a soft band under it, highlights its columns, fades the others and marks the line values; the tooltip follows the mouse (with the keyboard or a tap it stands above the highest of them). Columns grow once when the chart appears and lines draw in from the left; both slide to new values on change and are off with reduced motion.
