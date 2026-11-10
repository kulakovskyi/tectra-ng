# Stage 11 — charts, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Charts live in `@tectra-ng/charts/<name>` (own package, one entry point per chart, no dependencies) and are drawn as SVG by Angular templates — the same markup on the server and in the browser. Sources: the first consumer app's chart libraries (usage = elements, 2026-11-09) — their API, behaviour and look are the reference for the charts it has; the rest of the catalogue gets our own design in the same language. Its root font size is 14px, so its `1rem` is 14px. Checked against its chart libraries on 2026-11-10: spline, column, pie, bar-list, segmented-bar, heatmap, treemap, rank-line, org-chart (+ `ui/sparkline`, done in stage 7) — every one has an item below; its pages draw no chart outside them.

**Build order (2026-11-10):** the first app's charts first, so it can switch over — 11.7 bar list, 11.8 segmented bar, 11.9 heatmap, 11.10 treemap, 11.11 rank line, 11.17 org chart; then 11.4 combo, 11.6 scatter and the rest in number order.

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/` (colours only through tokens: series palette, grid, axis text, tooltip, legend), `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page (category `Charts`, `source:` / `package:` front matter) with an example per feature, unit tests (scales and layouts as pure functions), e2e check of what the chart does, axe clean in light and dark and in every style, no layout shift after hydration, motion off with `prefers-reduced-motion`, lint clean.

---

## 11.0 Package ✅

- [x] `@tectra-ng/charts` is a published package: `project.json`, `package.json` (peers on `@tectra-ng/*`, no dependencies, `publishConfig`), `ng-package.json`, `tsconfig.base.json` paths, module boundary (`pkg:charts` → ui and below), `build:packages` / `test` scripts, `release.projects`, part of `tectra-ng`, install docs (README, `INSTALL_PACKAGES`), docs category `Charts`

## 11.1 Core — `charts/core` (46) ✅

First app: a shared core for every chart — language (month names and toolbar texts per locale), "No data" text when there is no series, number formatter per language, the series palette read from the theme variables, grid / axis label / legend colours from the theme, the app font, a thin card-coloured stroke between pie and treemap segments.

- [x] Scales as pure functions: linear, log, time (with calendar-aware ticks), band; nice domains and ticks; tick formatting through the tectra locale (`Intl.NumberFormat`, `Intl.DateTimeFormat`), compact numbers (`1.2K`)
- [x] Layout: plot area from the size of the host, axis label space measured from the ticks, responsive size (`height` as a number or `'100%'` of a parent with a definite height), the same markup on the server (fixed `viewBox`), the real size after hydration without a jump
- [x] Axes and grid: x / y, top / bottom / left / right, label rotation or skipping when they collide, grid lines, zero line
- [x] Series palette from tokens (`--tx-chart-…` from the primary and the severity palettes), per series `color` override, stable colours when a series is hidden
- [x] Legend: position (top, bottom, side), toggles a series, keyboard, `txChartLegend` template
- [x] Tooltip on the kit overlay: crosshair, shared (all series at a point) or single, `txChartTooltip` template, follows the keyboard focus
- [x] "No data" through `empty-state` look, loading skeleton of the same size
- [x] Motion: series grow in once, values morph on change; off with reduced motion
- [x] Decimation for long series (largest-triangle) so tens of thousands of points stay fast
- [x] Accessibility: `role="img"` with a summary, a hidden data table for screen readers, arrow keys walk the points and read them
- [x] Docs + tests; e2e: server markup equals the hydrated one, resize redraws, legend toggle, tooltip on hover and keyboard

## 11.2 Line and area — `charts/line` (18) ✅

First app (`spline`, 18): smooth area / line chart for trends over time — `series` (`{ name, data }[]`), `categories` (labels or ISO dates), `toolbar` (download), `height` (450); new inputs redraw in place.

- [x] `<tx-line-chart>`: `series`, `categories` or x values, `curve` (smooth monotone, straight, step), `area` (gradient fill from the series colour), markers, gaps for `null`, `height`
- [x] Stacked areas, 100% areas
- [x] Time x axis with real gaps between dates
- [x] Docs + tests; e2e

The first app's `toolbar` (download) input comes with export in 11.18; until then the chart has no download menu.

## 11.3 Column and bar — `charts/column` (18) ✅

First app (`column`, 18): always stacked, `series`, `categories`, `stackType` `normal` / `100%`, `height` (350, or `'100%'` of the parent), `horizontal`, `toolbar` (download).

- [x] `<tx-column-chart>`: grouped, stacked, 100%; vertical / `horizontal`; bar radius and gap from tokens; data labels on bars
- [x] Negative values around the zero line
- [x] Docs + tests; e2e

`toolbar` (download) — with export in 11.18.

## 11.4 Combo — `charts/combo`

- [ ] Columns + lines in one plot, a second y axis, per series `type` and `axis`
- [ ] Docs + tests; e2e

## 11.5 Pie and donut — `charts/pie` (9) ✅

First app (`pie`, 9): donut with `pieData` (`{ series, labels }`), `chartWidth` (200), `chartHeight` (400), `showLegend`, `showDataLabels` (`%` on segments), `totalLabel` (always show the total in the centre with this caption), `totalFormatter` (centre total and the hovered value), `donutSize` (`'65%'`), `segmentGap` (2, card-coloured stroke); a legend list beside a small donut (`label`, `value`, `percent`, `color`) instead of the chart's own.

- [x] `<tx-pie-chart>`: pie and donut (`innerRadius`), segment gap, centre content (`txPieCenter` template, total by default), hovered segment in the centre, data labels, start angle and half donut
- [x] Legend beside the chart with value and percent; the same palette exported for own legends
- [x] Docs + tests; e2e

The hole is `donutSize` (the first app's name, `'0%'` = pie). `toolbar` (download) — with export in 11.18.

## 11.6 Scatter and bubble — `charts/scatter`

- [ ] `<tx-scatter-chart>`: x / y points, bubble size, per point colour, trend line
- [ ] Docs + tests; e2e

## 11.7 Bar list — `charts/bar-list` (11) ✅

First app: a top-N ranking — label over a share bar scaled to the biggest value, formatted value, percent of the total; sorted descending, zero values dropped; `items` (`{ label, value, link?, queryParams? }` — a row with a link is a router link with a hover background), `limit` (10); "No data" when empty.

- [x] `<tx-bar-list>` with the first app's API and look; plus `valueFormat`, `loading` (skeleton rows), `ariaLabel`, `dt` (`chart.barList`), `pt`, `unstyled`
- [x] Docs + tests; e2e

## 11.8 Segmented bar — `charts/segmented-bar` (6) ✅

First app: parts of one whole in one bar with a legend — `items` (`{ key, label, value, tone? }`, tones `primary`, `secondary` (primary mixed 35% into the card), `success`, `info`, `warn`, `danger`, `neutral`), `size` `small` (7px rounded bar) / `large` (31.5px track with the percent inside each segment), `showLegend`, `showValue`, `showPercent`, `hideEmptyInLegend`, `monoLabels`; order kept, zero and negative values not drawn; projected content at the end of the legend row; each segment titled `label: value`.

- [x] `<tx-segmented-bar>` with the first app's API and look; plus `valueFormat`, `ariaLabel` (the bar is read as an image when the legend is hidden), `dt` (`chart.segmentedBar`, a colour and a text token per tone), `pt`, `unstyled`
- [x] Docs + tests; e2e

The percent inside a large segment is dark on the bright tones in dark mode — the first app's light text there fails the contrast check.

## 11.9 Heatmap — `charts/heatmap` (4) ✅

First app: rows × columns grouped in bands (days by week, hours by day), each cell coloured by a tone; sticky header row, sticky row header and value columns, scroll both ways inside `maxHeight` (`26rem`), 14px rounded cells that scale on hover / focus when interactive, tooltip and aria label per cell, legend under the grid; `groups`, `rows`, `legend`, `labels`, `maxHeight`, `cellClick` (click / Enter / Space); `chartHeatmapRowHeader` and `chartHeatmapRowValue` templates for the sticky row header and value columns; the cell and the legend are separate parts (a legend cell is drawn without interaction).

- [x] `<tx-heatmap>` with the first app's API and look (`txHeatmapRowHeader` / `txHeatmapRowValue` directives pick the templates; `row.label` for the default header)
- [x] Value heatmap with a colour scale (not only tones): `value` cells, `scaleSteps`, `scaleMin`, `scaleMax`, value legend items; calendar heatmap (`heatmapCalendar()`, weeks by month × weekdays, any range)
- [x] Docs + tests; e2e

The wheel over the grid scrolls the page once the grid has nothing left to scroll (the first app's `overscroll-behavior: contain` trapped it); only sideways overscroll stays contained.

## 11.10 Treemap — `charts/treemap` (1) ✅

First app: share of a total split into many categories, `items` (`{ label, value }`), `height` (350), name and formatted value drawn inside the tiles so nothing overlaps, zero values dropped, "No data" when empty.

- [x] `<tx-treemap>`: squarified layout (pure function), labels that fit or end with an ellipsis (HTML in the tile, so any font or `pt` style stays inside), `txTreemapTile` template for own tile content, nested groups; tooltip with the share, hover dims the rest, arrow keys walk the tiles, `tileClick`, `valueFormat`, `tooltipFormatter`, `loading`
- [x] Docs + tests; e2e

## 11.11 Rank line — `charts/rank-line` (1) ✅

First app: search positions over real check times — rank 1 on top, one line per series with its own colour, a gap for a check without a rank, tooltip with the date, series name, rank and an optional note; `series` (`{ name, color, points: { time, rank | null, note? }[] }`), `maxRank` (ticks by 5 up to 20, by 10 deeper), `rankLabel`, `height`; a 12-colour line palette with stable colours by series index.

- [x] `<tx-rank-chart>` with the first app's API and look; `color` optional (`rankLineColor(index)` from the 12-colour `chart.rankLine` tokens), optional legend that toggles series, `pointClick`, arrow keys walk a series and switch series, `note` in the core tooltip
- [x] Docs + tests; e2e

## 11.12 Radar, radial bar and gauge

- [ ] `<tx-radar-chart>`: axes around a centre, filled series, grid rings
- [ ] `<tx-radial-bar>` and `<tx-gauge>`: rings with values, a needle gauge with bands
- [ ] Docs + tests; e2e

## 11.13 Funnel, waterfall and bullet

- [ ] `<tx-funnel-chart>`, `<tx-waterfall-chart>` (running total, up / down colours, total bars), `<tx-bullet-chart>` (value, target, ranges)
- [ ] Docs + tests; e2e

## 11.14 Financial and statistical

- [ ] `<tx-candlestick-chart>` (OHLC, volume), `<tx-boxplot-chart>`, range area (min–max band with a line)
- [ ] Docs + tests; e2e

## 11.15 Timeline and gantt

- [ ] `<tx-gantt-chart>`: rows of time ranges, groups, milestones, today line, scroll and zoom by time
- [ ] Docs + tests; e2e

## 11.16 Sankey and sunburst

- [ ] `<tx-sankey-chart>` (nodes and weighted links), `<tx-sunburst-chart>` (nested rings, drill down)
- [ ] Docs + tests; e2e

## 11.17 Org chart — `charts/org-chart` (2) ✅

First app: a hierarchy as a tree of cards on a pan / zoom canvas (drag, wheel / pinch zoom at the cursor, trackpad pan), toolbar (search, zoom − / % / +, fit, expand / collapse all, full screen), minimap with click / drag navigation, hotkeys (`+` `−` `0` `F` `/`), full screen with an overlay fallback and Escape, the hover path to the root, search focus, fit on first render; `nodes`, `highlightIds`, `focusId`, `labels`, `toolbar`, `minimap`, `height`, `busy`, `pathKinds`; outputs `nodeToggle`, `nodeClick`, `searchChange` (400ms), `expandAll`, `collapseAll`; `[chartOrgHeader]` slot and a `chartOrgNode` card template; the default card (icon / avatar, title, subtitle, pills, chevron) exported on its own for custom node templates; a node skeleton while `busy`.

- [x] `<tx-org-chart>` with the first app's API and look on kit parts (button, input, pill, avatar, skeleton, tooltip); texts from the tectra locale, `labels` overrides them; `txOrgChartHeader` / `txOrgChartNode` instead of `[chartOrgHeader]` / `#node`; helpers `orgChartToggle`, `orgChartExpandAll`, `orgChartSearch`, `orgChartReveal`, `orgChartPathTo`
- [x] Docs + tests; e2e

Changed on purpose: hotkeys work while the chart has the focus (not on the whole page) and arrow keys move the canvas; cards take the focus (Enter / Space = click); a drag never selects text; the hover path follows the connectors with their rounded corners and joins the card outline in one colour (`pathColor` drives both); the canvas cannot be moved so far that the tree leaves it (64px stay in view); the minimap frame stays inside the map.

## 11.18 Interaction

First app: zoom on a time axis in its traffic charts (2), a download toolbar on most charts.

- [ ] Zoom and pan on an axis (wheel, drag, pinch, keyboard), brush with an overview chart, reset
- [ ] Annotations: x / y lines, bands and points with labels
- [ ] Export PNG / SVG / CSV through `ui/export`
- [ ] Live updates: append points with a sliding window, smooth shift
- [ ] Docs + tests; e2e
