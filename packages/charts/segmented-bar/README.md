# Segmented Bar

`<tx-segmented-bar>` — parts of one whole in one bar with a legend: each part is a segment as wide as its share, coloured by a tone. A small 7px bar or a large one with the percent inside each segment; the legend lists the parts with their values and shares, and projected content sits at its end.

```ts
import { TxSegmentedBar } from '@tectra-ng/charts/segmented-bar';
```

```html
<tx-segmented-bar [items]="[{ key: 'paid', label: 'Paid', value: 8, tone: 'success' }, { key: 'due', label: 'Due', value: 3, tone: 'warn' }]" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ key, label, value, tone? }[]` — parts in the order they are drawn; zero and negative values are not drawn |
| size | `small` (thin rounded bar, default) or `large` (tall bar with the percent inside each segment) |
| showLegend | Shows the legend under the bar |
| showValue | Shows the value of each part in the legend |
| showPercent | Shows the share of each part in the legend |
| hideEmptyInLegend | Leaves parts with no value out of the legend |
| monoLabels | Writes the legend labels in the monospace font (codes, ids) |
| valueFormat | Format of values: `number`, `integer`, `compact`, `percent` or a function |
| ariaLabel | What the bar shows; names the legend list, or starts the summary read on the bar when the legend is hidden |
| dt | Design tokens of this bar (`chart`, group `segmentedBar`) |
| pt | Classes and styles of the parts: `root`, `track`, `segment`, `legend`, `legendItem`, `dot`, `label`, `value`, `percent`, `aside` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

Tones: `primary` (default), `secondary` (the primary colour mixed into the card), `success`, `info`, `warn`, `danger`, `neutral`.

## Slots
| Name | Description |
|---|---|
| default | Content at the end of the legend row (a total, a link) |
