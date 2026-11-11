# Sankey Diagram

`<tx-sankey-chart>` — how an amount flows between stages: traffic sources into pages and outcomes, a budget into departments, energy from sources to uses. Nodes stand in columns by their stage, links are as wide as their value. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxSankeyChart } from '@tectra-ng/charts/sankey';
```

```html
<tx-sankey-chart [links]="[{ source: 'Ads', target: 'Site', value: 60 }, { source: 'Site', target: 'Sign-up', value: 25 }]" />
```

## Inputs
| Name | Description |
|---|---|
| links | `{ source, target, value, color? }[]` — flows between node ids; self links, zero values and links that close a cycle are left out. An empty list shows "No data" |
| nodes | `{ id, label?, color? }[]` — optional names and colours; nodes found only in `links` use their id as the name |
| height | Height in px (360), or a CSS size such as `'100%'` of a parent with a definite height |
| align | `justify` (default) — nodes without outgoing flows stand in the last column; `left` — every node stands right after its sources |
| showValues | Writes the value after each node name when it fits (on by default) |
| showTooltip | Shows the tooltip of a node (in and out totals) or a link (value and share of its source) on hover and keyboard focus |
| valueFormat | Format of the values: `number`, `integer`, `compact`, `percent` or a function |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — node width, gap and radius, link colour strength and edge, labels, palette |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `node`, `link`, `label`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| nodeClick | A node was clicked: `id`, `label`, `incoming`, `outgoing` |
| linkClick | A link was clicked: `source`, `target`, `value` |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart |
| ← / → / ↑ / ↓ | Previous / next node, column by column; its flows light up and its totals are announced |
| Home / End | First / last node |
| Escape | Clears the focus |

## Notes

The layout is computed by the component: columns by the longest path from a source, node heights by the larger of their in and out flow, a few passes that pull each node towards the nodes it is linked to, and links stacked on their nodes in the order of their other ends so they cross as little as possible. Hovering a node lights its flows and fades the rest; hovering a link lights it and its two nodes. Links sweep in from the left once and slide to new values; both are off with reduced motion.
