# Cascade select

Pick a value through nested groups shown as columns — country → region → city, category → subcategory → item. The next column opens on hover or with ArrowRight; only leaves are values. Works with `[formControl]`, `ngModel` and signal forms.

## Inputs
| Name | Description |
|---|---|
| options | Top-level groups (or items) |
| optionLabel | Field of a leaf shown as its text |
| optionValue | Field of a leaf written into the value; empty string = the whole leaf |
| optionDisabled | Field that disables an item or a group |
| optionGroupLabel | Field of a group shown as its text |
| optionGroupChildren | Field with the children of a group, or one field per level (`['regions', 'cities']`) |
| dataKey | Field that identifies an object value |
| showPath | The field shows the whole path, e.g. "Poland / Masovia / Warsaw" |
| pathSeparator | Text between the parts of the path |
| placeholder | Text shown while nothing is selected |
| showClear | Button that clears the value |
| emptyMessage | Text of an empty list |
| inputId | Id of the field for a `<label for>` |
| ariaLabel | Accessible name of the field and the tree |
| ariaLabelledBy | Id of the element that labels the field |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the value, does not open |
| dt | Design tokens of this instance (`cascadeSelect`; options use the `select` tokens) |
| pt | Classes and styles of the parts: `root`, `box`, `trigger`, `value`, `clear`, `dropdown`, `panel`, `column`, `option`, `empty` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | A leaf was picked or the value cleared: `{ value, option, path }` (`path` holds the groups and the leaf) |
| opened | The panel was opened |
| closed | The panel was closed (the control is marked as touched) |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space / ArrowDown | Opens the panel at the current value |
| ArrowDown / ArrowUp | Next / previous item in the column, skipping disabled ones |
| ArrowRight / Enter | Opens a group and moves into it |
| ArrowLeft | Back to the parent column |
| Home / End | First / last item of the column |
| Enter / Space | Picks a leaf and closes |
| Letters | Jump to the item that starts with the typed text |
| Escape | Closes the panel |
