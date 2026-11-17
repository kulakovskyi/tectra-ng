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
| `niceDomain(min, max, count?, integer?)` | Widens a range to round numbers (`[3, 97]` → `[0, 100]`) |
| `linearTicks(min, max, count?, integer?)`, `tickStep`, `logTicks`, `timeTicks` | Round tick values; with `integer` the step is a whole number, at least 1 — the value axes of the charts do this for the `integer` format, so small counts never repeat a label |
| `toTime(value)` | ISO string (a date-only string is local midnight), `Date` or timestamp → ms |

## Formats

| Function | What it does |
|---|---|
| `chartNumberFormatter(intl, format)` | `number` (up to 2 decimals), `integer`, `compact` (`1.2K`), `percent`, a currency (`{ currency: 'USD', currencyDisplay? }` → `$36,400`, cents only when the value has them) or your function → `(value) => string` |
| `tickFormatter(intl, ticks, format)` | Like the above with as many decimals as the tick step needs; a currency in compact form (`$36K`) |
| `compactValueFormatter(intl, format)` | Short form for tight labels: a currency as `$36.4K`, `number` as `compact`, other formats as they are |
| `compactNumber(value, intl?)` | `1234567` → `1.2M` |
| `timeTickFormatter(intl, interval, span)`, `timeTooltipFormatter(intl, interval)` | Dates for ticks and tooltips through `Intl.DateTimeFormat` |
| `chartMonthNames(intl, 'long' \| 'short')` | 12 capitalised month names |
| `textWidth(text, fontSize)`, `truncateText(text, maxWidth, fontSize)` | Text width estimate that gives the same layout on the server and in the browser |

## Shapes, stacks, data

| Function | What it does |
|---|---|
| `linePath(points, curve)`, `areaPath(top, bottom, curve)` | SVG paths; `null` points split the path; curves `smooth` (monotone), `straight`, `step` |
| `barPath(rect, end, radius?)` | SVG path of a bar with the two corners of one `end` (`top`, `bottom`, `left`, `right`) or `all` four rounded, the radius shrunk to fit; `null` keeps it square. The column, combo and waterfall charts draw their bars with it, so a stroke follows the rounded fill |
| `stackValues(series, 'normal' \| '100%')` | `[from, to]` per value; positive and negative values stack apart |
| `largestTriangleThreeBuckets(points, threshold)`, `decimateSeries(points, threshold)` | Thin long series and keep their shape |
| `normalizeSeries(series, categories, xType)` | Turns `TxChartSeries[]` into labels, x values and a value table |
| `cartesianLayout(options)` | Plot area, value and category scales, tick labels (skipped or rotated when they collide), grid and zero line |
| `chartColor(index)`, `chartPalette(count?)`, `seriesColor(color, index)` | The series palette as `var(--tx-chart-series-colorN)`; colour 1 is the primary colour and the others turn its hue in OKLCH, so every primary gets six clearly different neighbours |
| `injectLegendPlace(position)`, `chartLegendPlace(position, width)`, `injectHostWidth()` | A `left` / `right` legend moves to the `bottom` when the chart is narrower than `TX_CHART_NARROW_WIDTH` (420px); the width is measured in the browser, the server keeps the asked position |

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

`TxChartSeries` (`name`, `data` — numbers or `{ x, y }` points, `color?`), `TxChartValueFormat` (`number`, `integer`, `compact`, `percent`, `TxChartCurrencyFormat` or a function), `TxChartCurrencyFormat` (`currency`, `currencyDisplay?` — formatted in the active tectra locale, compact on the axes and in full in tooltips; it follows locale switches), `TxChartTooltipFormatter` (`(value, { seriesIndex, dataPointIndex }) => string`), `TxChartLegendItem`, `TxChartTooltipData`, `TxChartLegendPosition`, `TxChartHeight`.

## Notes

Texts ("No data", the summary, the data table, announcements) come from the kit locale (`chartNoData`, `chartSummary`, …) and numbers and dates from `Intl` with the locale's `intl` code. The tokens are the `chart` group of `@tectra-ng/themes`.
