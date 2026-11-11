# Radial Bar

`<tx-radial-bar>` — progress of one or several items as concentric rings over a track: goals, quotas, completion. A full circle or any arc, the share in the centre. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxRadialBar } from '@tectra-ng/charts/radial-bar';
```

```html
<tx-radial-bar [items]="[{ label: 'Design', value: 80 }, { label: 'Build', value: 45 }]" totalLabel="Average" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ label, value, max?, color? }[]` — one ring per item, from the outside in. An empty list shows "No data" |
| max | Value of a full ring (100); an item's own `max` wins |
| height | Height in px (300), or a CSS size such as `'100%'` of a parent with a definite height |
| startAngle | Where the rings start, in degrees clockwise from the top (0) |
| endAngle | Where a full ring ends (360); `-135` / `135` draws a horseshoe |
| hole | Size of the empty centre as a share of the radius (`'35%'`) |
| track | Draws the track behind each ring (on by default) |
| centerValue | What the centre shows for an item: `percent` of its max (default) or the `value` |
| totalLabel | With several items, shows this caption and the average share in the centre until one is hovered |
| showLegend | Shows the legend; a single item never has one |
| legendPosition | `top`, `bottom` (default), `left` or `right` |
| legendAlign | `start`, `center` (default) or `end` for a top or bottom legend |
| legendVariant | Look of the legend: `dot` (default), `line`, `pill` or `stat` (values in large type with the share; it replaces the tooltip) |
| legendValues | Adds the value and the share to each legend item |
| showTooltip | Shows the tooltip on hover and keyboard focus |
| valueFormat | Format of the values: `number`, `integer`, `compact`, `percent` or a function |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — track colour, ring thickness, centre text, palette |
| pt | Classes and styles of the parts: `root`, `legend`, `legendItem`, `plot`, `svg`, `track`, `bar`, `center`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| barClick | A ring was clicked: `index`, `label`, `value`, `share` (0–1) |
| barToggle | A legend item hid or showed a ring: `index`, `label`, `hidden` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |
| txChartLegend | `<ng-template txChartLegend let-item>` — own legend item |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart, then the legend items |
| ← / → / ↑ / ↓ | Previous / next ring; announced, the centre and the tooltip follow |
| Home / End | Outer / inner ring |
| Escape | Clears the focus |

## Notes

Rings have round ends; values above the max fill the ring. Hovering a ring (or its legend item) fades the others and puts its label and share in the centre; the tooltip follows the mouse, or stands at the end of the ring for a tap and the keyboard. Rings draw in once, one after another, and slide to new values; both are off with reduced motion.
