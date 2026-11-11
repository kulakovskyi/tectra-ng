# @tectra-ng/charts

Angular charts drawn as SVG by the components themselves — no chart library and no dependencies. They render on the server with the same markup the browser hydrates, take every colour, font and size from the tectra design tokens (themes, dark mode and `dt` just work), use the kit's legend, tooltip overlay and locale, and can be read with the keyboard and screen readers.

```bash
npm install @tectra-ng/charts
```

Part of `tectra-ng`. One entry point per chart, so you only bundle what you import:

| Entry point | What it holds |
|---|---|
| `@tectra-ng/charts/line` | `<tx-line-chart>` — line and area, stacked and 100%, time axis, gaps, decimation |
| `@tectra-ng/charts/column` | `<tx-column-chart>` — columns and bars, stacked, 100% and grouped, data labels, negative values |
| `@tectra-ng/charts/combo` | `<tx-combo-chart>` — columns with lines or areas in one plot, a second value axis aligned to the grid of the first |
| `@tectra-ng/charts/pie` | `<tx-pie-chart>` — pie, donut and half donut, centre total, legend with values, `txPieLegend` |
| `@tectra-ng/charts/bar-list` | `<tx-bar-list>` — a top-N ranking: label over a share bar, value and percent of the total, router links |
| `@tectra-ng/charts/segmented-bar` | `<tx-segmented-bar>` — parts of one whole in one bar with tones, a small or a large bar, legend with values and shares |
| `@tectra-ng/charts/heatmap` | `<tx-heatmap>` — rows × grouped columns coloured by tones or a value scale, sticky headers, cell tooltips and clicks, `heatmapCalendar()` |
| `@tectra-ng/charts/treemap` | `<tx-treemap>` — squarified tiles sized by value, labels that fit, nested groups |
| `@tectra-ng/charts/rank-line` | `<tx-rank-chart>` — positions over time, rank 1 on top, gaps, notes in the tooltip |
| `@tectra-ng/charts/org-chart` | `<tx-org-chart>` — a tree of cards on a pan / zoom canvas with search, minimap, full screen and hotkeys |
| `@tectra-ng/charts/core` | scales, ticks, formats, curves, stacks, the chart frame, axes and legend — for your own charts |

```ts
import { TxLineChart } from '@tectra-ng/charts/line';
```

```html
<tx-line-chart [series]="[{ name: 'Visits', data: [120, 180, 150] }]" [categories]="['Mon', 'Tue', 'Wed']" />
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/cdk`, `@angular/router` (optional, for bar list links), `@tectra-ng/core`, `@tectra-ng/themes`, `@tectra-ng/ui`, `@tectra-ng/icons`. Docs and examples: [tectra-ng.com](https://tectra-ng.com/components/line-chart).
