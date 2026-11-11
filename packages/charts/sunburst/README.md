# Sunburst Chart

`<tx-sunburst-chart>` — a hierarchy as nested rings: each ring is a level, each segment is its share of the parent. Click a segment to zoom into it, click the centre to go back. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxSunburstChart } from '@tectra-ng/charts/sunburst';
```

```html
<tx-sunburst-chart [data]="[{ label: 'Europe', children: [{ label: 'France', value: 30 }, { label: 'Spain', value: 10 }] }]" />
```

## Inputs
| Name | Description |
|---|---|
| data | `{ label, value?, children?, color? }` or a list of them. A node's size is its `value`, or the sum of its children; children of a node with a larger `value` leave the rest of its arc empty. `color` applies to the node and its branch. Nothing with a value shows "No data" |
| levels | Rings shown at once (3); deeper levels appear when you zoom in |
| height | Height in px (380), or a CSS size such as `'100%'` of a parent with a definite height |
| drill | Clicking a segment with children zooms into it and the centre leads back (on by default) |
| showLabels | Writes the names on segments where they fit (on by default) |
| showTooltip | Shows the value, the share of the parent and of the total on hover and keyboard focus |
| totalLabel | Caption of the centre at the top level; "Total" by default |
| valueFormat | Format of the values: `number`, `integer`, `compact`, `percent` or a function |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — hole, gaps, corner radius, the fade of deeper rings, labels, centre, palette |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `segment`, `label`, `center`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| segmentClick | A segment was clicked or chosen with Enter: `path` (names from the top), `value`, `item` |
| focusChange | The chart zoomed in or out: the names of the branch now in the centre (`[]` at the top) |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart |
| ← / → | Previous / next segment of the same parent |
| ↓ / ↑ | First child / the parent |
| Home / End | First / last segment of the inner ring |
| Enter / Space | Zooms into the segment (and reports `segmentClick`) |
| Escape / Backspace | Clears the focus, then zooms out a level |

## Notes

Each branch takes the palette colour of its top segment and deeper rings fade towards the card colour, so the hierarchy reads at a glance. Hovering a segment keeps it and its parents bright and fades the rest. Zooming in or out redraws the rings with a short turn-in; off with reduced motion.
