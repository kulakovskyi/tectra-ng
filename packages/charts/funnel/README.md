# Funnel Chart

`<tx-funnel-chart>` — how many pass each step of a process: visits, sign-ups, trials, purchases. Centred bars sized by value, soft connectors between them and the conversion from the step before. Drawn as SVG by the component, rendered on the server and themed by the design tokens.

```ts
import { TxFunnelChart } from '@tectra-ng/charts/funnel';
```

```html
<tx-funnel-chart [items]="[{ label: 'Visits', value: 1000 }, { label: 'Sign-ups', value: 400 }, { label: 'Paid', value: 60 }]" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ label, value, color? }[]` — the steps from the top. An empty list shows "No data" |
| height | Height in px (320), or a CSS size such as `'100%'` of a parent with a definite height |
| colorful | Gives every step its own palette colour; by default the funnel is one colour |
| showLabels | Writes the step names in a column on the left (on by default) |
| showValues | Writes the values on the bars, or beside a bar that is too narrow (on by default) |
| showConversion | Writes the conversion from the step before between the bars (on by default) |
| connectors | Draws the soft shapes that join the bars (on by default) |
| showTooltip | Shows the value, the share of the first step and the conversion on hover and keyboard focus |
| valueFormat | Format of the values: `number`, `integer`, `compact`, `percent` or a function |
| toolbar | Shows the chart menu: download SVG, PNG or CSV (the file is named after `ariaLabel`) |
| loading | Shows a skeleton of the same size |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — row gap, radius, label column, text, connectors, palette |
| pt | Classes and styles of the parts: `root`, `plot`, `svg`, `stage`, `connector`, `label`, `value`, `conversion`, `tooltip`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| stageClick | A step was clicked: `index`, `label`, `value`, `ofFirst` and `conversion` (percent, `null` for the first) |

## Slots
| Name | Description |
|---|---|
| txChartTooltip | `<ng-template txChartTooltip let-data>` — own tooltip content |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the chart |
| ↑ / ↓ (← / →) | Previous / next step; the value and the conversion are announced, the tooltip follows |
| Home / End | First / last step |
| Escape | Closes the tooltip |

## Notes

The widest bar is the biggest value, so a step that grows is drawn wider. A row is picked anywhere across the chart. Bars grow from the centre once and slide to new values; both are off with reduced motion.
