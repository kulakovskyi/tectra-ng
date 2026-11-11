# Radar Chart

`<tx-radar-chart>` — values of several series on axes spread around a centre: compare profiles, skills or ratings at a glance. Filled polygons over polygon or circular grid rings. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxRadarChart } from '@tectra-ng/charts/radar';
```

```html
<tx-radar-chart [series]="[{ name: 'Model A', data: [80, 60, 70, 50, 90] }]" [categories]="['Speed', 'Power', 'Range', 'Comfort', 'Price']" />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, data, color? }[]` — one number (or `null`) per axis. An empty list shows "No data" |
| categories | Names of the axes, clockwise from the top |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| shape | Grid rings: `polygon` (default) or `circle` |
| min | Value at the centre; 0 or the nice minimum by default |
| max | Value at the outer ring; the nice maximum of the data by default |
| rings | Number of grid rings to aim for (4) |
| fill | Fills the polygons with a soft tint of the series colour (on by default) |
| markers | Draws a point on every value (on by default) |
| showTicks | Writes the ring values along the top axis |
| showLegend | Shows the legend; a single series never has one |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `dot` (default), `line`, `pill` or `stat` (the average of each series, or the value on the focused axis, in large type; it replaces the tooltip) |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| tooltipFormatter | `(value, { seriesIndex, dataPointIndex }) => string` for tooltip values |
| valueFormat | Format of the ring values and the tooltip: `number`, `integer`, `compact`, `percent` or a function |
| toolbar | Shows the chart menu in the top right corner: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — line width, fill, points, labels, grid, palette |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `ring`, `axisLine`, `axisLabel`, `series`, `area`, `line`, `marker`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| pointClick | An axis was clicked: `seriesIndex` (the series nearest to the pointer on that axis), `dataPointIndex`, `value`, `category` |
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
| ← / → | Previous / next axis; announced, the tooltip follows |
| ↑ / ↓ | Previous / next series on the axis |
| Home / End | First / last axis |
| Escape | Closes the tooltip |

## Notes

Hovering anywhere in a slice of the chart picks the nearest axis: its spoke and label light up, every series gets a marker on it and the tooltip lists them. The radius shrinks so the axis labels always fit. Polygons grow from the centre once and morph to new values; both are off with reduced motion.
