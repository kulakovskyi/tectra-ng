# Tree

Shows a hierarchy — folders, categories, menus — as a WAI-ARIA tree (`role="tree"`). Nodes open and close, can be selected one by one, several at once or with checkboxes that check a whole branch, searched, loaded lazily, moved by drag and drop (also between trees) and get a right-click menu. Nodes are `{ key, label, children?, icon?, expandedIcon?, collapsedIcon?, leaf?, expanded?, type?, selectable?, disabled?, draggable?, droppable?, loading?, styleClass?, data? }`. Also exports the helpers `walkTree`, `findNode`, `filterTree`, `moveNode`, `insertNode`, `removeNode`, `normalizeChecked`.

## Inputs
| Name | Description |
|---|---|
| value | Nodes of the tree; two-way with `[(value)]`, drag and drop writes the new order back |
| selectionMode | `single`, `multiple` or `checkbox`; leave empty for a tree without selection |
| selection | Selected node, or nodes in `multiple` / `checkbox` mode; two-way with `[(selection)]` |
| expandedKeys | Keys of the open nodes; two-way. Nodes with `expanded: true` are added on first sight |
| metaKeySelection | A click replaces the selection, Ctrl / ⌘ + click adds or removes a node |
| propagateSelectionUp | A parent is checked when all its children are, partly checked when some are |
| propagateSelectionDown | Checking a parent checks its whole branch |
| highlightOnSelect | Checked nodes also get the selected background |
| contextMenu | Menu items for a right click or Shift + F10 on a node |
| contextMenuSelection | The node the menu was opened for; two-way |
| draggableNodes | Nodes can be dragged (`draggable: false` keeps one in place) |
| droppableNodes | Nodes accept drops before, after or inside (`droppable: false` refuses inside) |
| draggableScope | Scope of the dragged nodes, matched against the target tree's `droppableScope` |
| droppableScope | Scopes this tree accepts from other trees |
| validateDrop | The drop waits until `accept()` of the `nodeDrop` event is called |
| loading | Shows the loading state |
| loadingMode | `mask` covers the tree with a spinner, `icon` only spins the togglers of loading nodes |
| loadingIcon | Icon of the mask |
| emptyMessage | Text when there are no nodes or the search found nothing |
| filter | Search field above the tree |
| filterBy | Fields searched, comma separated (`label`, `data.code`) |
| filterMode | `lenient` keeps the whole branch under a match, `strict` keeps only matching descendants |
| filterPlaceholder | Own placeholder of the search field |
| filterInputAutoFocus | Focuses the search field on start |
| scrollHeight | Maximum height of the scroll area; `flex` fills the parent |
| virtualScroll | Renders only the visible rows (needs `scrollHeight`) |
| virtualScrollItemSize | Height of one row in px with virtual scroll |
| virtualScrollTolerance | Rows rendered above and below the visible ones |
| ariaLabel | Accessible name of the tree |
| ariaLabelledBy | Id of the element that labels the tree |
| dt | Design tokens of this instance (`tree`) |
| pt | Classes and styles of the parts: `root`, `header`, `filter`, `filterInput`, `wrapper`, `list`, `node`, `content`, `toggler`, `checkbox`, `icon`, `label`, `children`, `dropPoint`, `empty`, `mask`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| nodeSelect | A node was selected or checked: `{ node, originalEvent }` |
| nodeUnselect | A node was unselected or unchecked |
| nodeExpand | A node was opened — load its children here when it has `leaf: false` and no `children` |
| nodeCollapse | A node was closed |
| nodeContextMenuSelect | The menu was opened for a node |
| nodeDoubleClick | A node was double clicked |
| nodeDrop | A node was dropped: `{ dragNode, dropNode, position, index, originalEvent, accept }` |
| filtered | The search changed: `{ filter, filteredValue }` |
| valueChange | The nodes changed after a drop |
| selectionChange | The selection changed |
| expandedKeysChange | A node was opened or closed |
| contextMenuSelectionChange | The menu node changed |

## Slots
| Name | Description |
|---|---|
| txTreeNode | `<ng-template txTreeNode let-node>` — content of a node; `txTreeNode="type"` only for nodes of that `type`. Context: `node`, `level`, `expanded`, `selected`, `checked`, `partial` |
| txTreeHeader | `<ng-template txTreeHeader>` — content above the tree |
| txTreeFooter | `<ng-template txTreeFooter>` — content below the tree |
| txTreeEmpty | `<ng-template txTreeEmpty>` — own empty state |
| txTreeLoading | `<ng-template txTreeLoading>` — own content of the loading mask |
| txTreeFilter | `<ng-template txTreeFilter let-query let-filter="filter">` — own search field; call `filter(text)` |
| txTreeToggleIcon | `<ng-template txTreeToggleIcon let-expanded>` — own toggler icon (`loading` in the context) |
| txTreeCheckboxIcon | `<ng-template txTreeCheckboxIcon let-checked let-partial="partial">` — own checkbox icon |

## Methods
| Name | Description |
|---|---|
| expandAll() | Opens every node with children |
| collapseAll() | Closes every node |
| filterNodes(text) | Searches the tree |
| resetFilter() | Clears the search |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves into the tree to the selected node (or the first one) and out of it |
| ArrowDown / ArrowUp | Next / previous visible node |
| ArrowRight | Opens a closed node, moves to the first child of an open one |
| ArrowLeft | Closes an open node, moves to the parent of a closed one |
| Home / End | First / last visible node |
| Enter / Space | Selects the node, toggles its checkbox in `checkbox` mode |
| * | Opens all siblings of the node |
| Letters | Moves to the next node whose label starts with the typed text |
| Shift + F10 / Context menu key | Opens the context menu |
| Alt + ArrowUp / ArrowDown | Moves the node before the previous / after the next sibling (drag and drop on) |
| Alt + ArrowRight / ArrowLeft | Moves the node into the previous sibling / out of its parent (drag and drop on) |
| ArrowDown in the search field | Moves to the tree |
