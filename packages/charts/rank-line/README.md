# Rank Chart

`<tx-rank-chart>` — positions over time (search ranks, leaderboards): rank 1 on top, one straight line per series in its own colour, a gap where a check has no rank, a tooltip with the date and time, the series, the rank and an optional note. Points sit at their real times on a time axis.

```ts
import { TxRankChart } from '@tectra-ng/charts/rank-line';
```

```html
<tx-rank-chart [series]="[{ name: 'example.com', points: [{ time: '2026-03-01T09:00', rank: 4 }, { time: '2026-03-02T09:00', rank: 2 }] }]" />
```

## Inputs
| Name | Description |
|---|---|
| series | `{ name, color?, points: { time, rank \| null, note? }[] }[]` — a `null` rank leaves a gap; without `color` the series takes one of 12 line colours by its index (`rankLineColor(index)`) |
| maxRank | The deepest rank on the axis (20); ticks by 5 up to 20, by 10 deeper; deeper ranks sit on the bottom line |
| rankLabel | Caption of the rank in the tooltip and the data table (`Position: 3`) |
| height | Height: px (360) or `'100%'` of a parent with a definite height |
| showLegend | Shows a legend that hides and shows series |
| legendPosition | `top` (default), `bottom`, `left` or `right` |
| legendAlign | `start` (default), `center` or `end` |
| legendVariant | Look of the legend markers: `line` (default), `dot` or `pill` |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`, group `rankLine`: line width, marker sizes, the 12 colours) |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `grid`, `axis`, `line`, `marker`, `legend`, `legendItem`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| pointClick | A point was clicked: `seriesIndex`, `pointIndex`, `name`, `time`, `rank`, `note` |
| seriesToggle | A legend item hid or showed a series: `index`, `name`, `hidden` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content (`data.note` holds the note) |
| txChartLegend | `<ng-template txChartLegend let-item>` — own legend item |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart, then the legend items |
| ← / → | Previous / next check of the series; announced with the date and rank |
| ↑ / ↓ | The nearest check of the previous / next series |
| Home / End | First / last check |
| Escape | Hides the tooltip |
