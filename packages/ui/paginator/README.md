# Paginator

Page navigation for long lists: first / previous / page / next / last buttons, a page size select, a page report, jump to page and a "Total: N" label.

```html
<tx-paginator [(first)]="first" [rows]="10" [totalRecords]="total()" (pageChange)="load($event)" />
```

`pageChange` gets `TxPageState` — `page` (0-based), `first`, `rows`, `pageCount`. Below 40rem the paginator is compact: fewer page links and no first / last buttons, so it fits one line on a phone.

For requests and responses of paginated lists use `TxPaginationParams` (`page` is 1-based, `limit` is the page size, `total` the number of records) and the helpers `pageToFirst`, `firstToPage`, `pageCountOf`.

## Inputs
| Name | Description |
|---|---|
| first | Index of the first record on the current page. Two-way: `[(first)]` |
| rows | Records per page. Two-way: `[(rows)]` — the page size select writes it |
| totalRecords | Number of records in the whole list |
| pageLinkSize | How many page buttons are shown around the current page |
| compactPageLinkSize | Page buttons in compact mode |
| compactBreakpoint | Width below which the paginator is compact, e.g. `40rem`; `null` turns compact mode off |
| rowsPerPageOptions | Page sizes for the select — numbers, or `{ showAll: 'All' }` for every record. The current `rows` is added when missing; empty hides the select |
| alwaysShow | Shows the paginator also when there is only one page |
| showFirstLastIcon | Shows the first and last page buttons |
| showPageLinks | Shows the page number buttons |
| showCurrentPageReport | Shows the page report, "3 of 12" by default (translated) |
| currentPageReportTemplate | Own report text with `{currentPage}`, `{totalPages}`, `{first}`, `{last}`, `{rows}`, `{totalRecords}` |
| showJumpToPageDropdown | Shows a select with every page number |
| showJumpToPageInput | Shows a field for a page number — Enter or leaving the field goes there |
| showTotal | Shows "Total: N" (translated) at the start; above the paginator on narrow screens |
| disabled | Disables every control |
| locale | Locale of the numbers, e.g. `uk-UA`; the tectra locale by default |
| dropdownScrollHeight | Maximum height of the select lists |
| firstPageIcon | Icon of the first page button |
| previousPageIcon | Icon of the previous page button |
| nextPageIcon | Icon of the next page button |
| lastPageIcon | Icon of the last page button |
| ariaLabel | Name of the navigation; "Pagination" by default (translated) |
| dt | Design tokens (`paginator`) |
| pt | Classes and styles of the parts: `root`, `total`, `bar`, `start`, `end`, `currentPageReport`, `first`, `previous`, `pages`, `page`, `next`, `last`, `jumpToPageDropdown`, `jumpToPageInput`, `rowsPerPageDropdown` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| pageChange | The page or the page size changed (`TxPageState`) |

## Slots
| Name | Description |
|---|---|
| txPaginatorStart | `<ng-template txPaginatorStart let-state>` — content at the start of the bar, gets `TxPageState` |
| txPaginatorEnd | `<ng-template txPaginatorEnd let-state>` — content at the end of the bar, gets `TxPageState` |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves between the buttons, the page field and the selects |
| Enter / Space | On a button: goes to that page |
| Enter | In the page field: goes to the typed page |
