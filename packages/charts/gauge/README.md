# Gauge

`<tx-gauge>` — one value on a scale: a progress arc in a tone, or a needle over coloured bands such as good / warning / critical. Ticks, the value and a caption in the middle. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxGauge } from '@tectra-ng/charts/gauge';
```

```html
<tx-gauge [value]="72" label="CPU" valueFormat="percent" />
```

## Inputs
| Name | Description |
|---|---|
| value | The value; `null` shows "No data" |
| min | Start of the scale (0) |
| max | End of the scale (100) |
| bands | `{ from, to, tone?, color?, label? }[]` — coloured ranges of the scale; the label of the band holding the value is read by screen readers |
| needle | Draws a needle; on by default when there are bands, otherwise the value fills a progress arc |
| tone | Colour of the progress arc: `primary` (default), `success`, `info`, `warn`, `danger` or `neutral`; also the default of a band |
| color | Any CSS colour for the progress arc instead of the tone |
| startAngle | Start of the scale in degrees clockwise from the top (-120) |
| endAngle | End of the scale (120); `-90` / `90` draws a half circle |
| label | Caption under the value |
| valueFormat | Format of the value and the ticks: `number`, `integer`, `compact`, `percent` or a function |
| ticks | Number of ticks to aim for (5) |
| showTicks | Draws the ticks with their values around the arc |
| showValue | Writes the value and the caption in the middle |
| height | Height in px (220), or a CSS size such as `'100%'` of a parent with a definite height |
| toolbar | Shows the chart menu: download SVG or PNG (the file is named after `ariaLabel` or `label`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the gauge measures; starts the text read by screen readers |
| dt | Design tokens of this chart (`chart`) — arc thickness, track, tones, needle, hub, ticks, value text |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `track`, `progress`, `band`, `needle`, `tick`, `value`, `label`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the geometry |

## Notes

The gauge is read as one image: "Gauge, CPU: 72% of 0% to 100%", plus the band label when the value is in a band. The progress arc draws in and the needle swings from the start of the scale once; both follow new values smoothly and are off with reduced motion.
