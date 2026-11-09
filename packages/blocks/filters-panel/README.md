# Filters panel

A card that holds the filter fields above a table or a list. Users choose which filters are shown and drag them into their own order; the choice is saved per panel. Below 1024px the fields fold into a "Filters" button.

```html
<tx-filters-panel stateKey="orders-filters" [busy]="loading()">
  <div txFilterField="search" filterLabel="Search" [filterActive]="search() | hasFilterValue">
    <tx-label subtle for="orders-search">Search</tx-label>
    <input txInput id="orders-search" [(ngModel)]="search" />
  </div>
  <div txFilterField="status" filterLabel="Status" [filterActive]="status() | hasFilterValue">
    <tx-label subtle for="orders-status">Status</tx-label>
    <tx-select inputId="orders-status" [options]="statuses" [(ngModel)]="status" />
  </div>
  <button txButton txFiltersActions txFiltersReset icon="filter-slash" severity="warn" aria-label="Clear filters" txTooltip="Clear filters" (click)="clear()"></button>
</tx-filters-panel>
```

Every field wrapper carries `txFilterField`; fields may sit at any depth, but only direct children of the panel follow the saved order. A field whose `filterActive` is `true` is always shown and cannot be hidden.

## Inputs
| Name | Description |
|---|---|
| variant | `card` — own frame (default); `plain` — no frame, for filters inside another card or a dialog |
| busy | While the list loads: every field turns into a skeleton of its label and control (same size, values kept) and the fields do not take the pointer |
| stateKey | Storage key of the layout. When set, the "Show filters" menu appears and the shown fields and their order are saved as `{ order, visible }` (an older array value is read as `visible`). Without it all fields are always shown |
| stateStorage | `local` (default) or `session` |
| collapse | When the fields fold behind the "Filters" button: `auto` below 1024px (default), `always`, `never`. A panel with one field never folds |
| defaultVisible | How many fields, from the start, are shown until the user changes the choice (default 3) |
| ariaLabel | Name of the `search` landmark |
| txFilterField | `[txFilterField]`: required key of the field inside the panel, used in the saved layout |
| filterLabel | `[txFilterField]`: required name of the field in the "Show filters" menu |
| filterActive | `[txFilterField]`: the filter has a value — the field is always shown and counts on the "Filters" button |
| dt | Design tokens of this instance (`filtersPanel`) |
| pt | Classes and styles of the parts: `root`, `toggle`, `panel`, `fields`, `actions`, `menuButton`, `menu` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| layoutChange | The user showed, hid or moved a field (`{ order, visible }`), or reset the layout (`null`) |
| expandedChange | The collapsed panel opened or closed (below 1024px) |

## Methods
| Name | Description |
|---|---|
| reset() | Removes the saved layout: the default fields and order come back |
| setExpanded(open) | Opens or closes the collapsed panel |

## Slots
| Name | Description |
|---|---|
| default | The filter fields, each wrapper with `txFilterField` |
| txFiltersActions | Buttons at the end of the panel: reset, create … |
| txFiltersReset | Marks the reset action: below 1024px it leaves the bar and a "Clear filters" button in the panel clicks it |

## Pipe — `hasFilterValue`
`value | hasFilterValue` is `true` for a non-blank string, a non-empty array and any other value except `null` / `undefined`. `a | hasFilterValue: b : c` is `true` when any of them has a value. The same check is exported as the `hasFilterValue()` function.

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the menu button: opens the "Show filters" menu; on a menu row: shows or hides the field |
| Arrow Down / Arrow Up | Moves through the menu rows and the reset item |
| Home / End | First / last menu item |
| Alt + Arrow Up / Alt + Arrow Down | Moves the focused field up / down in the order |
| Escape | Closes the menu, or the collapsed panel (focus goes back to the "Filters" button) |
