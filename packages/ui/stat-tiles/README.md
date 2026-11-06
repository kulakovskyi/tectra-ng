# Stat tiles

A responsive grid of key numbers — totals, rates, counts — each tile with a tinted icon, a label, a big value with a unit, a meta line, an optional share bar, an aside (a change pill) and room for a sparkline. Tiles can be links.

```html
<tx-stat-tiles ariaLabel="Traffic">
  <tx-stat-tile label="Visits" icon="eye" [value]="12480" meta="Last 30 days" />
  <tx-stat-tile label="Conversion" icon="percentage" tone="success" value="4.2" unit="%" [share]="42" />
</tx-stat-tiles>
```

## Inputs
| Name | Description |
|---|---|
| minWidth | `tx-stat-tiles` — narrowest column before the grid wraps; never below the `floorWidth` token (210px) unless `compact` |
| compact | `tx-stat-tiles` — tighter gap, padding, icon and value; columns down to `minWidth` |
| ariaLabel | `tx-stat-tiles` — accessible name of the list |
| ariaLabelledBy | `tx-stat-tiles` — id of the element that names the list |
| label | `tx-stat-tile` — what the number is |
| value | `tx-stat-tile` — the number or text; `null` shows "-" |
| unit | `tx-stat-tile` — small text after the value |
| icon | `tx-stat-tile` — icon in a square tinted with the tone |
| meta | `tx-stat-tile` — muted line under the value, cut with an ellipsis |
| tone | `tx-stat-tile` — `neutral`, `primary`, `success`, `info`, `warn` or `danger`: icon, share bar, accent value and highlight |
| share | `tx-stat-tile` — 0–100, draws a share bar (a `meter`) |
| textValue | `tx-stat-tile` — the value is text: smaller, one line, cut with an ellipsis and a title |
| fitValue | `tx-stat-tile` — the value shrinks with the tile width instead of wrapping |
| accentValue | `tx-stat-tile` — the value in the tone colour |
| highlighted | `tx-stat-tile` — tinted background and ring in the tone |
| link | `tx-stat-tile` — router link of the whole tile |
| queryParams | `tx-stat-tile` — query params of the router link |
| href | `tx-stat-tile` — plain URL of the whole tile |
| target | `tx-stat-tile` — link target; `_blank` adds `rel="noopener noreferrer"` |
| dt | Design tokens of this instance (`statTiles` / `statTile`) |
| pt | Classes and styles of the parts: `root` on the grid; `root`, `body`, `head`, `icon`, `main`, `label`, `value`, `unit`, `meta`, `aside`, `bar`, `barFill` on a tile |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txStatTileAside | `<tx-pill txStatTileAside>` — content at the top right of a tile, e.g. a change pill |
| default | `tx-stat-tile` — content under the value, e.g. a sparkline; `tx-stat-tiles` — the tiles |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the next link tile; the focused tile gets a 2px ring |
| Enter | Opens the link of the focused tile |

## Accessibility

`tx-stat-tiles` is a `list` and every tile a `listitem`; name the list with `ariaLabel` or `ariaLabelledBy`. Icons are decorative. The share bar is a `meter` named by the tile label. A link tile is one anchor, so its label, value and meta are read as the link text.
