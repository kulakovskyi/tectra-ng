# Box Plot

`<tx-boxplot-chart>` — how values spread in each category: the box from the first to the third quartile, the median, whiskers to the last values within 1.5 × IQR and the outliers beyond. Several series stand side by side. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxBoxplotChart } from '@tectra-ng/charts/boxplot';
```

```html
<tx-boxplot-chart [series]="[{ name: 'Response time', data: [[120, 135, 150, 180, 420], [90, 110, 115, 140]] }]" [categories]="['API', 'Web']" />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, data, color? }[]`; each entry of `data` is either raw values (`number[]`, the five numbers are computed) or ready numbers `{ min, q1, median, q3, max, outliers? }`, or `null`. An empty list shows "No data" |
| categories | Labels of the category axis, one per entry |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| showOutliers | Draws the outliers as rings (on by default) |
| showLegend | Shows the legend; a single series never has one |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| showTooltip | Shows the five numbers and the count of outliers on hover and keyboard focus |
| valueFormat | Value axis and tooltip format: `number`, `integer`, `compact`, `percent` or a function |
| yMin | Fixed start of the value axis |
| yMax | Fixed end of the value axis |
| xAxisTitle | Title of the category axis |
| yAxisTitle | Title of the value axis |
| grid | Grid lines: `value`, `category`, `both` or `none` |
| labelMode | Category labels that do not fit: `auto`, `rotate` or `skip` |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — box width and radius, fill, line widths, whisker caps, outliers, palette |
| pt | Classes and styles of the parts: `root`, `hoverBand`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `box`, `median`, `whisker`, `outlier`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| boxClick | A box was clicked: `seriesIndex`, `dataPointIndex`, `category`, `stats` (the five numbers and the outliers) |
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
| ← / → | Previous / next category; the five numbers are announced, the tooltip follows |
| ↑ / ↓ | Previous / next series in the category |
| Home / End | First / last category |
| Escape | Closes the tooltip |

## Notes

Quartiles are interpolated between values (the method of most spreadsheets). Hovering a category lays a soft band under it, picks the nearest box and fades the others. Boxes grow once; off with reduced motion.
