# Charts core

`@tectra-ng/charts/core` — the shared core of every tectra chart: pure functions for scales, ticks, number and date formats, curves, stacks and decimation, the chart frame (size, legend, tooltip, "No data", skeleton, accessibility) and the axes. The charts use it; you can build your own chart on it too.

```ts
import { linearScale, niceDomain, chartNumberFormatter, TxChartSeries } from '@tectra-ng/charts/core';
```

## Scales and ticks

| Function | What it does |
|---|---|
| `linearScale(domain, range)` | Maps numbers to pixels: `map`, `invert`, `ticks(count)` |
| `logScale(domain, range)` | Logarithmic scale; ticks are powers of ten (and 2 / 5 between them when there is room) |
| `timeScale(domain, range)` | Time in ms; `ticks(count)` and `interval(count)` pick calendar steps — seconds, minutes, hours, days, weeks, months, years |
| `bandScale(count, range, paddingInner?, paddingOuter?)` | Equal bands for categories: `start`, `center`, `bandwidth`, `indexAt` |
| `pointScale(count, range)` | Evenly spaced points from edge to edge: `at`, `indexAt` |
| `niceDomain(min, max, count?)` | Widens a range to round numbers (`[3, 97]` → `[0, 100]`) |
| `linearTicks(min, max, count?)`, `tickStep`, `logTicks`, `timeTicks` | Round tick values |
| `toTime(value)` | ISO string (a date-only string is local midnight), `Date` or timestamp → ms |

## Formats

| Function | What it does |
|---|---|
| `chartNumberFormatter(intl, format)` | `number` (up to 2 decimals), `integer`, `compact` (`1.2K`), `percent` or your function → `(value) => string` |
| `tickFormatter(intl, ticks, format)` | Like the above with as many decimals as the tick step needs |
| `compactNumber(value, intl?)` | `1234567` → `1.2M` |
| `timeTickFormatter(intl, interval, span)`, `timeTooltipFormatter(intl, interval)` | Dates for ticks and tooltips through `Intl.DateTimeFormat` |
| `chartMonthNames(intl, 'long' \| 'short')` | 12 capitalised month names |
| `textWidth(text, fontSize)`, `truncateText(text, maxWidth, fontSize)` | Text width estimate that gives the same layout on the server and in the browser |

## Shapes, stacks, data

| Function | What it does |
|---|---|
| `linePath(points, curve)`, `areaPath(top, bottom, curve)` | SVG paths; `null` points split the path; curves `smooth` (monotone), `straight`, `step` |
| `stackValues(series, 'normal' \| '100%')` | `[from, to]` per value; positive and negative values stack apart |
| `largestTriangleThreeBuckets(points, threshold)`, `decimateSeries(points, threshold)` | Thin long series and keep their shape |
| `normalizeSeries(series, categories, xType)` | Turns `TxChartSeries[]` into labels, x values and a value table |
| `cartesianLayout(options)` | Plot area, value and category scales, tick labels (skipped or rotated when they collide), grid and zero line |
| `chartColor(index)`, `chartPalette(count?)`, `seriesColor(color, index)` | The series palette as `var(--tx-chart-series-colorN)` |

## Components

| Name | What it is |
|---|---|
| `TxChartFrame` (`tx-chart-frame`) | The box of a chart: measures itself after hydration, places the legend, shows the tooltip on the kit overlay (beside the mouse cursor with the arrow at it, following it; for a touch or the keyboard pinned to the data with an arrow, on the side the data gives), "No data", the skeleton, the summary and the hidden data table, and forwards pointer and arrow-key events; with `zoomable` it also turns Ctrl + wheel, pinches and sideways swipes into `zoomed` / `panned` and shows a "Reset zoom" button while `zoomedIn` |
| `TxChartAxes` (`g[tx-chart-axes]`) | Grid, zero line, tick labels and titles from `cartesianLayout().axes` |
| `TxChartLegend` (`tx-chart-legend`) | Legend items that toggle series; arrow keys move between them; variants `dot`, `line`, `pill` and `stat` (a value in large type) |
| `TxChartAnnotations` (`g[tx-chart-annotations]`), `chartAnnotationShapes(list, mapping)`, `TxChartAnnotation` | Lines, bands and points with labels on a cartesian chart: the chart maps x and y to pixels, the core places shapes and label pills inside the plot (`chart.annotation` tokens) |
| `TxChartHoverBand` (`g[tx-chart-hover-band]`), `chartBandRect(band, index, plot, horizontal?)` | The soft band under the hovered category of a bar-like chart; it fades in and slides between categories (`chart.hoverBand` tokens) |
| `TxChartTooltipTemplate` (`ng-template[txChartTooltip]`) | Own tooltip content in any chart |
| `TxChartLegendTemplate` (`ng-template[txChartLegend]`) | Own legend item in any chart |

## Types

`TxChartSeries` (`name`, `data` — numbers or `{ x, y }` points, `color?`), `TxChartValueFormat`, `TxChartTooltipFormatter` (`(value, { seriesIndex, dataPointIndex }) => string`), `TxChartLegendItem`, `TxChartTooltipData`, `TxChartLegendPosition`, `TxChartHeight`.

## Notes

Texts ("No data", the summary, the data table, announcements) come from the kit locale (`chartNoData`, `chartSummary`, …) and numbers and dates from `Intl` with the locale's `intl` code. The tokens are the `chart` group of `@tectra-ng/themes`.
