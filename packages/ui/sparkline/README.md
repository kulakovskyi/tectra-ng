# Sparkline

A tiny trend line — an SVG line with a soft filled area — for a list of numbers. Use it in stat tiles, table cells or cards where a full chart is too much.

```html
<tx-sparkline [values]="visitsByDay" tone="success" />
```

## Inputs
| Name | Description |
|---|---|
| values | Numbers in order; fewer than two finite numbers draw nothing |
| tone | Line and area colour: `primary`, `info`, `success`, `warn` or `danger` |
| ariaLabel | Text for screen readers, e.g. "Visits went up 12% this week"; without it the sparkline is hidden from them |
| dt | Design tokens of this instance (`sparkline`) |
| pt | Classes and styles of the parts: `root`, `svg`, `area`, `line` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Keyboard
| Key | Action |
|---|---|
| — | Not focusable |

## Notes

The line is scaled between the smallest and the largest value, so it shows the shape of the trend, not absolute values; there are no axes or tooltips. The host is a full-width block, `height` token high (31.5px); set a size on the host to change it — the SVG stretches and the line keeps its width. `sparklinePoints(values)` returns the points in a 120 × 36 box.
