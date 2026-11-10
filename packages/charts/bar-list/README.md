# Bar List

`<tx-bar-list>` — a top-N ranking: each row is a label over a bar scaled to the biggest value, the formatted value and its percent of the total. Rows are sorted from the biggest value, zero and negative values are dropped, a row with a link becomes a router link.

```ts
import { TxBarList } from '@tectra-ng/charts/bar-list';
```

```html
<tx-bar-list [items]="[{ label: 'Germany', value: 420 }, { label: 'France', value: 310 }]" />
```

## Inputs
| Name | Description |
|---|---|
| items | `{ label, value, link?, queryParams? }[]` — rows in any order; no positive values show "No data" |
| limit | How many rows to show (10); the percent stays the share of the whole total |
| valueFormat | Format of values: `number`, `integer`, `compact`, `percent` or a function |
| loading | Shows skeleton rows |
| ariaLabel | What the list shows, read by screen readers |
| dt | Design tokens of this list (`chart`, group `barList`) |
| pt | Classes and styles of the parts: `root`, `list`, `item`, `row`, `track`, `bar`, `label`, `value`, `percent`, `empty`, `skeleton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves between rows that have a link |
| Enter | Opens the link of the focused row |
