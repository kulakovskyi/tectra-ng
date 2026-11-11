# Waterfall Chart

`<tx-waterfall-chart>` — how a starting value turns into a result step by step: each bar floats from the running total, increases and decreases in their own colours, total bars close a section. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxWaterfallChart } from '@tectra-ng/charts/waterfall';
```

```html
<tx-waterfall-chart [items]="[{ label: 'Start', value: 120 }, { label: 'Costs', value: -45 }, { label: 'Result', total: true }]" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ label, value?, total?, color? }[]` — a step adds `value` to the running total; `total: true` draws the running total from zero instead. An empty list shows "No data" |
| height | Height in px (350), or a CSS size such as `'100%'` of a parent with a definite height |
| dataLabels | Writes the signed change (or the total) above or below each bar (on by default) |
| connectors | Draws a dashed line from each bar's end to the next bar (on by default) |
| showLegend | Shows the legend of increase, decrease and total when there is more than one kind |
| legendPosition | `top`, `bottom`, `left` or `right` |
| legendAlign | `start`, `center` or `end` for a top or bottom legend |
| showTooltip | Shows the change and the running total on hover and keyboard focus |
| valueFormat | Value axis, labels and tooltip format: `number`, `integer`, `compact`, `percent` or a function |
| yMin | Fixed start of the value axis |
| yMax | Fixed end of the value axis |
| xAxisTitle | Title of the category axis |
| yAxisTitle | Title of the value axis |
| grid | Grid lines: `value`, `category`, `both` or `none` |
| labelMode | Category labels that do not fit: `auto`, `rotate` or `skip` |
| maxLabelWidth | Longer category labels are cut with an ellipsis (220px) |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — increase, decrease and total colours, connectors, bar radius and width |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `grid`, `axis`, `bar`, `connector`, `dataLabel`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| barClick | A step was clicked: `index`, `label`, `change`, `total` (the running total after it), `kind` (`up`, `down`, `total`) |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart |
| ← / → | Previous / next step; the change and the running total are announced, the tooltip follows |
| Home / End | First / last step |
| Escape | Closes the tooltip |

## Notes

The legend only names the colours, so it does not hide anything. Hovering a step fades the others. Bars grow one after another from their start once and slide to new values; both are off with reduced motion.
