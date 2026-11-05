# Tree select

Pick from a hierarchy — folders, categories, org units. A select whose panel is a tree (`role="tree"`): expand with the arrows, search keeps the parents of what matches, one node, several nodes, or checkboxes that check a whole branch. The value is the node `key` (an array of keys for several). Also exports the tree helpers `walkTree`, `findNode`, `descendantKeys`, `normalizeChecked`.

## Inputs
| Name | Description |
|---|---|
| options | Nodes: `{ key, label, children?, icon?, selectable?, disabled?, data? }` |
| selectionMode | `single`, `multiple` or `checkbox` (a parent checks its branch; partly checked parents show a dash) |
| display | With several values: `comma` or `chip` |
| expandedKeys | Keys of the open nodes; two-way with `[(expandedKeys)]` |
| filter | Search field in the panel |
| filterPlaceholder | Own placeholder of the search field |
| placeholder | Text shown while nothing is selected |
| showClear | Button that clears the value |
| emptyMessage | Text when the tree is empty or the search found nothing |
| scrollHeight | Maximum height of the tree |
| inputId | Id of the field for a `<label for>` |
| ariaLabel | Accessible name of the field and the tree |
| ariaLabelledBy | Id of the element that labels the field |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the value, does not open |
| dt | Design tokens of this instance (`select`; the tree uses `tree`) |
| pt | Classes and styles of the parts: `root`, `box`, `trigger`, `value`, `chip`, `clear`, `dropdown`, `panel`, `filter`, `filterInput`, `tree`, `node`, `toggler`, `empty` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | The value changed: `{ value, node }` |
| expandedKeysChange | A node was opened or closed |
| opened | The panel was opened |
| closed | The panel was closed (the control is marked as touched) |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space / ArrowDown | Opens the panel |
| ArrowDown / ArrowUp | Next / previous visible node |
| ArrowRight | Opens a node, or moves to its first child |
| ArrowLeft | Closes a node, or moves to its parent |
| Home / End | First / last visible node |
| Enter / Space | Selects the node (closes with `single`), toggles it with `multiple` / `checkbox` |
| Letters | Jump to the node that starts with the typed text |
| Backspace | With `display="chip"` on a closed field, removes the last value |
| Escape | Closes the panel |
