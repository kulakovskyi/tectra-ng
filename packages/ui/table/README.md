# Table

Data table for lists: sorting, pagination, server data, selection, row actions with a right-click menu, column resize, reorder and settings saved per table, frozen columns, row expansion and cards on narrow screens.

```html
<tx-table [value]="people()" [columns]="columns" dataKey="id" paginator [rows]="10">
  <ng-template txTableCell="name" let-person>
    <strong>{{ person.name }}</strong>
  </ng-template>
</tx-table>
```

Columns are `TxTableColumn` objects: `field` (a dot reads a nested value, `team.name`), `header`, `sortable` (on unless `false`), `sortField`, `reorderable`, `resizable`, `hideable`, `hidden`, `width` (fixed, no resize), `initialWidth`, `minWidth`, `maxWidth` (CSS lengths; columns are 100px until resized), `frozen` (`start` / `end`), `align` (`start` / `center` / `end`), `headerClass`, `cellClass`, `footer`, `cardTitle` (this column is the title of the card), `hideInCard`.

A cell shows the value of its field as text; `<ng-template txTableCell="field">` replaces it. Text that does not fit is cut with an ellipsis.

Sorting and pagination run on `value` unless `lazy` is on — then `lazyLoad` asks the server for `{ first, rows, sortField, sortOrder, multiSortMeta }` and `totalRecords` is the size of the whole list. A set `totalRecords` without `lazy` also means `value` is already the current page.

## Inputs
| Name | Description |
|---|---|
| value | Rows of the table |
| columns | Column definitions (`TxTableColumn[]`). Two-way: `[(columns)]` — dragging headers writes the new order |
| dataKey | Field that identifies a row — for selection, expansion and stable rendering |
| size | `small`, `medium` (default), `large` |
| showGridlines | Borders between all cells (on by default) |
| stripedRows | Every second row is tinted |
| rowHover | Highlights the row under the pointer (on by default) |
| scrollHeight | Maximum height of the scrolling area, e.g. `400px`; the header stays on top |
| loading | Blurs the table and shows a spinner; `aria-busy` on the table |
| emptyMessage | Text of an empty table; "No results found" by default (translated) |
| ariaLabel | Name of the table |
| ariaLabelledBy | Id of the element that names the table |
| rowClass | Function `(row, index)` that returns classes for a row |
| sortMode | `single` (default) or `multiple` — with `multiple`, Ctrl / ⌘ + click adds a column to the sort |
| sortField | Field the table is sorted by. Two-way: `[(sortField)]` |
| sortOrder | `asc`, `desc` or `null`. Two-way: `[(sortOrder)]`; a click goes asc → desc → none |
| multiSortMeta | Sort of `multiple` mode, `{ field, order }[]`. Two-way: `[(multiSortMeta)]` |
| customSort | Rows are not sorted by the table — sort `value` yourself on `sortChange` |
| lazy | Rows come from a server: no local sorting or slicing, `lazyLoad` asks for data |
| lazyLoadOnInit | `lazy`: asks for the first page right away (on by default) |
| paginator | Shows `tx-paginator` |
| paginatorPosition | `bottom` (default), `top` or `both` |
| first | Index of the first row of the page. Two-way: `[(first)]` |
| rows | Rows per page. Two-way: `[(rows)]` |
| totalRecords | Number of rows of the whole list (server data) |
| rowsPerPageOptions | Page sizes for the paginator select |
| showTotal | "Total: N" next to the paginator |
| showCurrentPageReport | Page report of the paginator |
| currentPageReportTemplate | Own page report text (`{currentPage}`, `{totalPages}`, `{first}`, `{last}`, `{rows}`, `{totalRecords}`) |
| showFirstLastIcon | First and last page buttons (on by default) |
| showPageLinks | Page number buttons (on by default) |
| showJumpToPageDropdown | Page select of the paginator |
| showJumpToPageInput | Page field of the paginator |
| alwaysShowPaginator | Shows the paginator also for one page (on by default) |
| pageLinks | Number of page buttons |
| selectionMode | `single` / `multiple` — click and keys select rows; `checkbox` / `radio` — a selection column at the start |
| selection | Selected row (`single`, `radio`) or rows (`multiple`, `checkbox`). Two-way: `[(selection)]` |
| metaKeySelection | `multiple`: a click selects one row, Ctrl / ⌘ + click adds, Shift + click selects a range (on by default) |
| rowSelectable | Function `(row, index)` — `false` makes a row not selectable |
| selectAll | Own state of the "select all" checkbox — for selection across pages on the server; the table then only emits `selectAllChange` |
| expandedRowKeys | `dataKey` values of the expanded rows. Two-way: `[(expandedRowKeys)]` |
| expandableRows | Function `(row, index)` — `false` hides the expand button of a row |
| resizableColumns | Drag handles between headers (keys: Arrow Left / Right on a handle) |
| columnResizeMode | `expand` (default) — only the column changes, the table may scroll; `fit` — the next column gives the width |
| reorderableColumns | Headers can be dragged to a new place (keys: Alt + Arrow Left / Right on a header) |
| columnSettings | Gear button with the visible columns; with `reorderableColumns` the list is also dragged (or Alt + Arrow Up / Down) to change the order |
| actionsSettings | Adds the row actions tab to the settings: order (drag) and which are shown inline |
| actionsInlineCount | How many row actions are shown inline before the `…` button, until the user pins others |
| actionsHeader | Header of the actions column; "Actions" by default (translated) |
| actionsFrozen | The actions column stays at the end while the table scrolls sideways (on by default) |
| stateKey | Saves widths, order, hidden columns, sort, page and action settings under this key |
| stateStorage | `local` (default) or `session` |
| toolbar | Shows the toolbar row also without settings — for `[txTableToolbar]` content |
| contextMenu | Own right-click menu (`TxMenuItem[]`); the row is in `contextMenuSelection` |
| contextMenuSelection | Row the context menu was opened on. Two-way: `[(contextMenuSelection)]` |
| rowContextMenu | Right-click opens the row actions as a menu (on by default) |
| responsive | Rows become cards below `breakpoint` (on by default) |
| breakpoint | Width below which rows are cards, `64rem` by default |
| dt | Design tokens (`table`) |
| pt | Classes and styles of the parts: `root`, `toolbar`, `frame`, `scroller`, `table`, `thead`, `headerRow`, `headerCell`, `sortButton`, `sortIcon`, `tbody`, `row`, `cell`, `tfoot`, `footerCell`, `loading`, `empty`, `paginator`, `cards`, `card` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| sortChange | Sort changed: `{ field, order, multiSortMeta }` |
| pageChange | Page or page size changed (`TxPageState`) |
| lazyLoad | `lazy`: data is needed — `{ first, rows, sortField, sortOrder, multiSortMeta }` |
| rowClick | A row was clicked: `{ row, index, originalEvent }` |
| rowSelect | A row was selected |
| rowUnselect | A row was unselected |
| selectAllChange | The "select all" checkbox changed (`true` / `false`) |
| rowExpand | A row was expanded |
| rowCollapse | A row was collapsed |
| columnResize | A column was resized: `{ field, width }` |
| columnReorder | Columns were reordered: `{ columns, from, to }` |
| columnVisibilityChange | Hidden columns changed (their fields) |
| contextMenuSelect | The own context menu opened on a row |

## Slots
| Name | Description |
|---|---|
| txTableCell | `<ng-template txTableCell="field" let-row let-value="value" let-index="index">` — content of the cells of a column |
| txTableHeaderCell | `<ng-template txTableHeaderCell="field" let-column>` — own header content |
| txTableFooterCell | `<ng-template txTableFooterCell="field" let-column>` — footer content of a column |
| txTableActions | `<ng-template txTableActions let-row>` — actions column; put `tx-table-actions` with buttons marked `*txTableAction="{ label }"` inside |
| txTableExpansion | `<ng-template txTableExpansion let-row>` — content of an expanded row; adds the expand column |
| txTableCard | `<ng-template txTableCard let-row let-index="index">` — own card for a row on narrow screens |
| txTableEmpty | `<ng-template txTableEmpty>` — own content of an empty table |
| txTableToolbar | `<div txTableToolbar>` — content on the left of the toolbar row, next to the settings gear |

## Inputs — tx-table-actions
| Name | Description |
|---|---|
| inlineCount | How many actions are shown inline outside a table, or before the user pins actions in its settings; the rest go to a `…` popover |

## Inputs — *txTableAction
| Name | Description |
|---|---|
| txTableAction | `{ label, id? }` — the label is used in the settings and the right-click menu; `id` defaults to a slug of the label |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through sort buttons, resize handles, checkboxes and buttons in cells |
| Enter / Space | On a header: sorts; on a row (`single` / `multiple`): selects it |
| Ctrl / ⌘ + Enter | On a header in `multiple` sort mode: adds the column to the sort |
| Arrow Up / Arrow Down | Moves between rows (`single` / `multiple`) |
| Home / End | First / last row |
| Shift + Arrow Up / Down | `multiple`: extends the selection |
| Ctrl / ⌘ + A | `multiple`: selects all rows of the page |
| Alt + Arrow Left / Right | On a header with `reorderableColumns`: moves the column |
| Arrow Left / Right | On a resize handle: narrower / wider by 10px |
| Alt + Arrow Up / Down | In the settings list: moves the column or the action |
