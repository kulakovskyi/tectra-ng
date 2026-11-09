# Command palette

A search button for the top bar and a ⌘K / Ctrl K window with grouped results: the keyboard moves through them, Enter opens one — through the router, or by running its command. The host only supplies the items and runs its own search; for a fixed list (the menu pages) the palette filters by itself.

```html
<tx-command-palette
  placeholder="Search pages and domains"
  [items]="results()"
  [groupLabels]="{ pages: 'Pages', domains: 'Domains' }"
  [loading]="searching()"
  (searchChange)="searchDomains($event)"
  (closed)="clearResults()"
/>
```

`menuPaletteItems` turns a sidebar menu (`TxPanelMenuItem[]`) into page items; `commandPaletteFilter` matches the label and the sublabel. Both are also exported as functions (`menuPaletteItems()`, `filterPaletteItems()`).

The window is a dialog with a combobox: the field owns the focus, the active result is announced with `aria-activedescendant`, focus goes back to the button after closing, and the page does not scroll behind it.

## Inputs
| Name | Description |
|---|---|
| label | Text of the button and name of the window; the translated "Search" by default |
| placeholder | Placeholder of the search field; the label by default |
| icon | Icon of the button (`search`) |
| items | Results in display order (`TxCommandPaletteItem[]`: `id`, `group`, `label`, `sublabel`, `icon`, `routerLink` + `queryParams`, `command`); a group title shows where `group` changes |
| groupLabels | Group id → title, e.g. `{ pages: 'Pages' }`; a missing id shows as is |
| loading | A spinner in the field and a "Searching…" row |
| emptyText | Text when a query finds nothing; translated by default |
| loadingText | Text of the loading row; translated by default |
| minQueryLength | Shortest term `searchChange` sends; shorter terms send `''` (default 2) |
| debounceTime | Delay in ms before `searchChange` (default 300) |
| shortcutKey | Key that opens and closes the window with ⌘ / Ctrl (default `k`) |
| localFilter | The palette filters `items` by the query itself — for fixed lists |
| compact | The button shows only its icon (it does so by itself below 768px) |
| dt | Design tokens of this instance (`commandPalette`) |
| pt | Classes and styles of the parts: `root`, `trigger`, `overlay`, `panel`, `search`, `results`, `item`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| queryChange | The trimmed query on every keystroke |
| searchChange | The debounced term for a server search; `''` when shorter than `minQueryLength` |
| itemSelect | A result was picked (click or Enter), before navigation |
| opened | The window opened |
| closed | The window closed |

## Methods
| Name | Description |
|---|---|
| open() | Opens the window |
| close() | Closes it and clears the query |
| select(item) | Picks a result: emits `itemSelect`, navigates or runs its command, closes |

## Keyboard
| Key | Action |
|---|---|
| ⌘ K / Ctrl K | Opens or closes the window |
| Arrow Down / Arrow Up | Moves through the results, wrapping around |
| Enter | Opens the active result |
| Escape | Closes the window, focus goes back to the button |
