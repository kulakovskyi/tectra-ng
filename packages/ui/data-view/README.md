# Data view

Shows a collection with your own list and grid templates — cards of products, files, people — with a layout switch, pagination, sorting, search, server data, a loading overlay and an empty state. The templates receive the items of the current page.

## Inputs
| Name | Description |
|---|---|
| value | Items |
| layout | `list` or `grid`; two-way, the grid template is used in `grid` |
| paginator | Paginator below, above or around the items |
| paginatorPosition | `bottom`, `top` or `both` |
| first | Index of the first item on the page; two-way |
| rows | Items per page; two-way |
| totalRecords | Number of items on the server (with `lazy`) |
| pageLinks | Page links shown at once |
| rowsPerPageOptions | Page sizes in the size select |
| alwaysShowPaginator | Shows the paginator even with one page |
| showCurrentPageReport | Shows "1–10 of 50" |
| currentPageReportTemplate | Own report text with `{first}`, `{last}`, `{totalRecords}`, `{currentPage}`, `{totalPages}`, `{rows}` |
| showJumpToPageDropdown | Select of pages |
| showJumpToPageInput | Number input of the page |
| showFirstLastIcon | First / last page buttons |
| showPageLinks | Page number buttons |
| showTotal | "Total: N" before the paginator |
| lazy | Pages, sort and search come from the server through `lazyLoad` |
| lazyLoadOnInit | Emits `lazyLoad` once on start |
| loading | Blurred loading overlay with a spinner |
| emptyMessage | Text when there is nothing to show |
| sortField | Field to sort by; two-way |
| sortOrder | `asc`, `desc` or `null`; two-way |
| filterBy | Fields searched by `filterValue`, comma separated |
| filterValue | Search text; two-way, also set by `filter(text)` |
| ariaLabel | Accessible name of the items region |
| dt | Design tokens of this instance (`dataView`) |
| pt | Classes and styles of the parts: `root`, `header`, `content`, `empty`, `loading`, `footer`, `paginator` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| layoutChange | The layout was switched |
| lazyLoad | The server should send items: `{ first, rows, sortField, sortOrder, filter }` |
| pageChange | The page changed: `{ page, first, rows, pageCount }` |
| sortChange | The sort changed: `{ sortField, sortOrder }` |
| firstChange | The first item index changed |
| rowsChange | The page size changed |
| sortFieldChange | The sort field changed |
| sortOrderChange | The sort order changed |
| filterValueChange | The search text changed |

## Slots
| Name | Description |
|---|---|
| txDataViewList | `<ng-template txDataViewList let-items>` — items of the page in the list layout |
| txDataViewGrid | `<ng-template txDataViewGrid let-items>` — items of the page in the grid layout |
| txDataViewHeader | `<ng-template txDataViewHeader>` — content above, e.g. `<tx-data-view-layout [(layout)]>` and a sort select |
| txDataViewFooter | `<ng-template txDataViewFooter>` — content below |
| txDataViewEmpty | `<ng-template txDataViewEmpty>` — own empty state |
| txDataViewLoading | `<ng-template txDataViewLoading>` — own content of the loading overlay |
| txDataViewPaginatorStart | `<ng-template txDataViewPaginatorStart let-state>` — content at the start of the paginator |
| txDataViewPaginatorEnd | `<ng-template txDataViewPaginatorEnd let-state>` — content at the end of the paginator |

Give the list and grid templates the items for typing — `<ng-template txDataViewList [txDataViewListOf]="products" let-items>` — and `items` gets their type in strict templates; without it they stay untyped.

## Inputs — item templates
| Name | Description |
|---|---|
| txDataViewListOf | `txDataViewList`: the items, only for the type of `let-items` |
| txDataViewGridOf | `txDataViewGrid`: the items, only for the type of `let-items` |

## Layout switch
`<tx-data-view-layout [(layout)]="layout" />` — two toggle buttons (list, grid) with `aria-pressed`.

## Inputs — tx-data-view-layout
| Name | Description |
|---|---|
| layout | `list` (default) or `grid`. Two-way: `[(layout)]` |
| size | Size of the buttons: `small`, `medium` (default), `large` |
| ariaLabel | Accessible name of the button group; "Layout" by default (translated) |
| unstyled | Removes the tectra styles |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through the layout switch, your item content and the paginator |
| Enter / Space on a layout button | Switches the layout |
