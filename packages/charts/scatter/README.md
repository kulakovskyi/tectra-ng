# Scatter Chart

`<tx-scatter-chart>` — points on two value axes to show how two measures relate, and bubbles when a third value sets the size. Per point colours and labels, a linear trend line per series, numbers or dates on the x axis. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxScatterChart } from '@tectra-ng/charts/scatter';
```

```html
<tx-scatter-chart [series]="[{ name: 'Orders', data: [{ x: 12, y: 340 }, { x: 18, y: 410 }, [25, 520]] }]" trendLine />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, data, color? }[]`; `data` holds points `{ x, y, size?, color?, label? }` or tuples `[x, y]` / `[x, y, size]`. A point with `size` turns the chart into bubbles; a `null` y is skipped. An empty list shows "No data" |
| xType | `linear` (numbers, default) or `time` (dates, timestamps or ISO strings) |
| annotations | Marks on the plot: `{ type: 'x-line', x }`, `{ type: 'y-line', y }`, `{ type: 'x-band', from, to }`, `{ type: 'y-band', from, to }`, `{ type: 'point', x, y }`, each with an optional `label`, `tone` (`neutral`, `primary`, `success`, `info`, `warn`, `danger`) or `color`; `x` is a number or a date like the points |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| trendLine | Draws a dashed least-squares line through each series |
| showLegend | Shows the legend; a single series never has one |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `dot` (default), `line`, `pill` or `stat` (the number of points, or the y value of the focused point, in large type; it replaces the tooltip) |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| xValueFormat | Format of the x axis and x values: `number`, `integer`, `compact`, `percent` or a function (not for `time`) |
| valueFormat | Format of the y axis and y values |
| sizeFormat | Format of the bubble size in the tooltip |
| yScale | `linear` or `log` |
| xMin | Fixed start of the x axis (a timestamp for `time`) |
| xMax | Fixed end of the x axis |
| yMin | Fixed start of the y axis |
| yMax | Fixed end of the y axis |
| xAxisTitle | Title of the x axis, also the name of x in the tooltip |
| yAxisTitle | Title of the y axis, also the name of y in the tooltip |
| sizeLabel | Name of the bubble size in the tooltip; "Size" by default |
| grid | Grid lines: `both` (default), `value`, `category` (vertical) or `none` |
| xAxisPosition | Side of the x axis: `bottom` or `top` |
| yAxisPosition | Side of the y axis: `left` or `right` |
| toolbar | Shows the chart menu in the top right corner: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — point and bubble radius, fill opacity, trend line, palette |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `annotation`, `point`, `trendLine`, `guide`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| pointClick | A point was clicked: `seriesIndex`, `dataPointIndex` (in the series `data`), `x`, `y`, `size`, `label` |
| seriesToggle | A legend item hid or showed a series: `seriesIndex`, `name`, `hidden` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content; `data.rows` holds the series, x, y and size |
| txChartLegend | `<ng-template txChartLegend let-item>` — own legend item |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart, then the legend items |
| ← / → | Previous / next point of the series by x; announced, the tooltip follows |
| ↑ / ↓ | Previous / next series, at the point nearest to the same x |
| Home / End | First / last point of the series |
| Escape | Closes the tooltip |

## Notes

The pointer picks the nearest point within a few pixels of its edge, so small points are easy to hit; the point gets a ring in its colour and dashed guides to both axes. A bubble's area, not its radius, follows its size, and bigger bubbles are drawn first so small ones stay on top. Points pop in once when the chart appears and slide to new values on change; both are off with reduced motion.
