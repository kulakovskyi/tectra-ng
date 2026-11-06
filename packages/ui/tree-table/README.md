# Tree table

A table whose rows form a tree (`role="treegrid"`) and looks like the table: the first column gets a toggler and an indent, children open under their parent like an accordion. Built on `tx-table`, so it keeps its columns, cell templates, sorting (siblings are sorted on every level), pagination (of the root nodes), server data, filters (parents of the matches stay and open), column resize, reorder, settings and freezing, scroll height, virtual scroll, editing, row actions, context menu and CSV export. Rows are nodes `{ key?, data, children?, leaf?, expanded?, selectable?, loading? }`; cells read `data`. Every input, output and slot of the table works the same way — the tables below list the tree parts and the most used table ones.

## Inputs
| Name | Description |
|---|---|
| value | Root nodes |
| columns | Columns (`TxTableColumn`); the first visible one holds the toggler |
| dataKey | Field of `data` that identifies a row when nodes have no `key` |
| expandedKeys | Keys of the open nodes; two-way. Nodes with `expanded: true` are added on first sight |
| selectionMode | `single`, `multiple` (rows) or `checkbox` (a checkbox next to the toggler, select all in the header) |
| selection | Selected node or nodes; two-way |
| metaKeySelection | A click replaces the selection, Ctrl / ⌘ + click adds a row |
| propagateSelectionUp | A parent is checked when all its children are, partly checked when some are |
| propagateSelectionDown | Checking a parent checks its whole branch |
| filterMode | `lenient` keeps the whole branch under a match, `strict` keeps only matching descendants |
| filters | Column filters; two-way |
| globalFilter | Search over all columns; two-way |
| sortMode | `single` or `multiple` |
| sortField | Sorted field; two-way |
| sortOrder | `asc`, `desc` or `null`; two-way |
| paginator | Paginator under the table; pages count root nodes |
| rows | Root nodes per page; two-way |
| first | Index of the first root node on the page; two-way |
| totalRecords | Number of root nodes on the server (with `lazy`) |
| lazy | Sorting, pages and filters come from the server through `lazyLoad` |
| loading | Blurred loading overlay with a spinner |
| resizableColumns | Columns can be resized |
| reorderableColumns | Columns can be dragged to another place |
| scrollHeight | Height of the scroll area with a sticky header |
| virtualScroll | Renders only the visible rows (needs `scrollHeight`) |
| size | `small`, `medium`, `large` |
| showGridlines | Borders around every cell |
| stripedRows | Every second row is tinted |
| rowHover | Rows are highlighted under the pointer |
| responsive | Cards below the breakpoint (off by default for a tree) |
| contextMenu | Menu items for a right click on a row |
| ariaLabel | Accessible name of the tree grid |
| dt | Design tokens of this instance (`table`; the indent and the gap next to the toggler come from `treeTable`) |
| pt | Classes and styles of the table parts, plus `treeToggle` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| nodeExpand | A node was opened — load its children here when it has `leaf: false` and no `children` |
| nodeCollapse | A node was closed |
| expandedKeysChange | A node was opened or closed |
| selectionChange | The selection changed |
| rowSelect | A row was selected or checked: `{ row, index, originalEvent }` (`row` is the node) |
| rowUnselect | A row was unselected or unchecked |
| sortChange | The sort changed |
| pageChange | The page changed |
| lazyLoad | The server should send another page, sort or filter |
| filterChange | Filters changed |

## Slots
| Name | Description |
|---|---|
| txTableCell | `<ng-template txTableCell="field" let-data let-node="node">` — own cell content; `data` is the node data |
| txTableHeaderCell | `<ng-template txTableHeaderCell="field" let-column>` — own header content |
| txTableFooterCell | `<ng-template txTableFooterCell="field">` — own footer content |
| txTableEmpty | `<ng-template txTableEmpty>` — own empty state |
| txTableEditor | `<ng-template txTableEditor="field">` — own cell editor |

## Methods
| Name | Description |
|---|---|
| expandAll() | Opens every node with children |
| collapseAll() | Closes every node |
| exportCSV() | Downloads every node (in tree order) as CSV |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the focused row, then to the togglers and controls inside it |
| ArrowDown / ArrowUp | Next / previous row |
| ArrowRight | Opens a closed row, moves to the first child of an open one |
| ArrowLeft | Closes an open row, moves to the parent of a closed one |
| Home / End | First / last row |
| Enter / Space | Selects the row or toggles its checkbox |
| Enter on the toggler | Opens or closes the row |
