# Table

Data table for lists: sorting, pagination, server data, selection, row actions with a right-click menu, column resize, reorder and settings saved per table, frozen columns, row expansion and cards on narrow screens.

```html
<tx-table [value]="people()" [columns]="columns" dataKey="id" paginator [rows]="10">
  <ng-template txTableCell="name" let-person>
    <strong>{{ person.name }}</strong>
  </ng-template>
</tx-table>
```

Columns are `TxTableColumn` objects: `field` (a dot reads a nested value, `team.name`), `header`, `sortable` (on unless `false`), `sortField`, `reorderable`, `resizable`, `hideable`, `hidden`, `width` (fixed, no resize), `initialWidth`, `minWidth`, `maxWidth` (CSS lengths; columns are 100px until resized), `frozen` (`start` / `end`), `align` (`start` / `center` / `end`), `headerClass`, `cellClass`, `footer`, `cardTitle` (this column is the title of the card), `hideInCard`; filters: `filter`, `filterField`, `filterType` (`text`, `numeric`, `date` — a date picker, `boolean`), `filterMatchModes`, `filterOptions` (`{ label, value }[]` — a multi select with the `in` match mode), `filterPlaceholder`; editing: `editable`, `editType` (`text`, `numeric`, `date` — a date picker, `boolean`), `editOptions` (a select).

A cell shows the value of its field as text; `<ng-template txTableCell="field">` replaces it. Text that does not fit is cut with an ellipsis.

Filtering, sorting and pagination run on `value` unless `lazy` is on — then `lazyLoad` asks the server for `{ first, rows, sortField, sortOrder, multiSortMeta, filters, globalFilter }` and `totalRecords` is the size of the whole list. A set `totalRecords` without `lazy` also means `value` is already the current page.

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
| caption | Text of a `<caption>` hidden on screen: names the table for screen readers when there is no `ariaLabel`, or describes it in more words |
| rowClass | Function `(row, index)` that returns classes for a row |
| sortMode | `single` (default) or `multiple` — with `multiple`, Ctrl / ⌘ + click adds a column to the sort |
| sortField | Field the table is sorted by. Two-way: `[(sortField)]` |
| sortOrder | `asc`, `desc` or `null`. Two-way: `[(sortOrder)]`; a click goes asc → desc → none |
| multiSortMeta | Sort of `multiple` mode, `{ field, order }[]`. Two-way: `[(multiSortMeta)]` |
| customSort | Rows are not sorted by the table — sort `value` yourself on `sortChange` |
| lazy | Rows come from a server: no local sorting or slicing, `lazyLoad` asks for data |
| filterDisplay | `menu` (default) — a filter button in the header opens rules with match modes, and / or, add / remove rule, Clear and Apply; `row` — a row of filter fields under the headers with a match mode menu |
| filters | Column filters, `{ [field]: { operator, rules: { value, matchMode }[] } }`. Two-way: `[(filters)]` |
| globalFilter | Text searched in every column (or `globalFilterFields`). Two-way: `[(globalFilter)]` — bind it to an own search field |
| globalFilterFields | Fields the global search looks in; the visible columns by default |
| filterDelay | Milliseconds to wait after typing in a text filter of the filter row (and before `lazyLoad` for the global search) |
| editMode | `cell` — a click, Enter or F2 edits a cell, Enter / Tab saves, Escape cancels; `row` — an edit column with edit, save and cancel buttons |
| editingRowKeys | `dataKey` values of the rows in edit (`row` mode). Two-way: `[(editingRowKeys)]` |
| reorderableRows | A drag handle column; rows move by drag or Alt + Arrow Up / Down on the handle, `rowReorder` gets the new order |
| frozenValue | Rows pinned above the body; they stay under the header while the table scrolls |
| groupRowsBy | Field the rows are grouped by; rows are sorted by it first |
| rowGroupMode | `subheader` (default) — a header row per group (and `txTableGroupFooter`); `rowspan` — the group cell spans its rows |
| expandableRowGroups | Group headers get a toggle that collapses the group |
| expandedRowGroups | Values of the open groups; `null` (default) — all open. Two-way: `[(expandedRowGroups)]` |
| virtualScroll | Renders only the rows in view — for long lists; needs `scrollHeight` and rows of one height. With `lazy`, rows that are `null` / `undefined` show skeletons and `lazyLoad` asks for the visible range |
| virtualScrollItemSize | Height of a row in px with `virtualScroll` |
| virtualScrollTolerance | Rows rendered above and below the view |
| cellTooltip | Text cut with an ellipsis shows a tooltip with the full text |
| csvSeparator | Separator of `exportCSV()` |
| exportFilename | File name of `exportCSV()` |
| exportFunction | Function `(row, column)` that returns the value written to the CSV |
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
| filterChange | Filters or the global search changed: `{ filters, globalFilter, filteredValue }` |
| cellEditInit | A cell went into edit: `{ row, index, field, value, previousValue }` |
| cellEditComplete | A cell edit was saved — the table writes the value into the row |
| cellEditCancel | A cell edit was cancelled |
| rowEditInit | A row went into edit: `{ row, index, changes, previous }` |
| rowEditSave | A row edit was saved — the table writes `changes` into the row; `previous` holds the old values |
| rowEditCancel | A row edit was cancelled |
| rowReorder | A row was moved: `{ from, to, value }` — `value` is the new order, set it as `value` |
| rowGroupToggle | A group was collapsed or expanded: `{ value, expanded }` |
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
| txTableActions | `<ng-template txTableActions let-row>` — actions column; put `tx-table-actions` with buttons marked `*txTableAction="{ label }"` inside; the `…` popover closes once an action in it is clicked |
| txTableExpansion | `<ng-template txTableExpansion let-row>` — content of an expanded row; adds the expand column |
| txTableCard | `<ng-template txTableCard let-row let-index="index">` — own card for a row on narrow screens |
| txTableEmpty | `<ng-template txTableEmpty>` — own content of an empty table |
| txTableEditor | `<ng-template txTableEditor="field" let-value="value" let-set="set" let-commit="commit" let-cancel="cancel">` — own editor of a column |
| txTableGroupHeader | `<ng-template txTableGroupHeader let-row let-value="value" let-count="count" let-toggle="toggle">` — content of a group header |
| txTableGroupFooter | `<ng-template txTableGroupFooter let-value="value" let-count="count" let-rows="rows">` — row after a group, e.g. its total |
| txTableToolbar | `<div txTableToolbar>` — content on the left of the toolbar row, next to the settings gear |

The row templates take the table rows only for typing — `<ng-template txTableCell="name" [txTableCellOf]="deals()" let-deal>` gives `deal` the row type in strict templates; without it the row stays untyped.

## Inputs — row templates
| Name | Description |
|---|---|
| txTableCellOf | `txTableCell`: the rows of the table, only for the type of `let-row` |
| txTableEditorOf | `txTableEditor`: the rows of the table, only for the type of `let-row` |
| txTableActionsOf | `txTableActions`: the rows of the table, only for the type of `let-row` |
| txTableExpansionOf | `txTableExpansion`: the rows of the table, only for the type of `let-row` |
| txTableCardOf | `txTableCard`: the rows of the table, only for the type of `let-row` |
| txTableGroupHeaderOf | `txTableGroupHeader`: the rows of the table, only for the type of `let-row` and `rows` |
| txTableGroupFooterOf | `txTableGroupFooter`: the rows of the table, only for the type of `let-row` and `rows` |

## Methods
| Name | Description |
|---|---|
| exportCSV(options?) | Downloads the visible columns of the filtered and sorted rows as CSV (UTF-8 with BOM, quoted, formulas guarded); `{ selectionOnly, filename }`; returns the text |
| clearFilters() | Clears the column filters and the global search |
| clearState() | Removes the saved state of `stateKey` |

## Inputs — tx-table-actions
| Name | Description |
|---|---|
| inlineCount | How many actions are shown inline outside a table, or before the user pins actions in its settings; the rest go to a `…` popover |

## Inputs — *txTableAction
| Name | Description |
|---|---|
| txTableAction | `{ label, id? }` — the label is used in the settings and the right-click menu; `id` defaults to a slug of the label. Works inside `@if` and other blocks; an action without a config is left out |

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
| Alt + Arrow Up / Down | In the settings list: moves the column or the action; on a row handle: moves the row |
| Enter / F2 | On an editable cell (`editMode="cell"`): starts editing |
| Enter / Tab / Shift + Tab | In a cell editor: saves (Tab moves to the next editable cell) |
| Escape | In an editor: cancels |
