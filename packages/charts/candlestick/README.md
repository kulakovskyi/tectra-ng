# Candlestick Chart

`<tx-candlestick-chart>` — prices over time as candles or OHLC bars: open, high, low and close of each period, rising and falling in their own colours, with the volume under them. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxCandlestickChart } from '@tectra-ng/charts/candlestick';
```

```html
<tx-candlestick-chart [data]="[{ x: '2026-03-02', open: 100, high: 112, low: 97, close: 110, volume: 1200 }]" />
```

## Inputs
| Name | Description |
|---|---|
| data | `{ x, open, high, low, close, volume? }[]` in time order; `x` is a date (`Date` or an ISO string) or any label. Periods stand side by side, so weekends and holidays leave no gaps. An empty list shows "No data" |
| variant | `candle` (default) or `ohlc` (a bar with ticks for the open and the close) |
| showVolume | Draws the volume as bars along the bottom, on their own scale (on when there is volume) |
| height | Height in px (380), or a CSS size such as `'100%'` of a parent with a definite height |
| showTooltip | Shows open, high, low, close and volume on hover and keyboard focus |
| valueFormat | Price format: `number`, `integer`, `compact`, `percent` or a function |
| volumeFormat | Volume format in the tooltip (`compact`) |
| yMin | Fixed start of the price axis |
| yMax | Fixed end of the price axis |
| yAxisTitle | Title of the price axis |
| grid | Grid lines: `value` (default), `category`, `both` or `none` |
| labelMode | Date labels that do not fit: `skip` (default), `auto` or `rotate` |
| yAxisPosition | Side of the price axis: `right` (default) or `left` |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — up and down colours, body width and radius, wick width, volume height and opacity |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `grid`, `axis`, `candle`, `wick`, `body`, `volume`, `crosshair`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| candleClick | A period was clicked: `index`, `label` (the formatted date), `candle` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart |
| ← / → | Previous / next period; the four prices are announced, the tooltip follows |
| Home / End | First / last period |
| Escape | Closes the tooltip |

## Notes

A rising period (close ≥ open) takes the up colour, a falling one the down colour; the volume bar under it takes the same colour, softer. The price axis leaves the bottom part of the chart to the volume, so candles and volume do not overlap. Hovering a period draws a crosshair and fades the others. Candles grow once; off with reduced motion.
