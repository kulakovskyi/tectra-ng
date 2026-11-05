# Listbox

A list of options shown inline, without a popup — pick one value or several. Works with `[formControl]`, `ngModel` and signal forms. Uses the same option engine as select: groups, search, virtual scroll, lazy loading and templates.

## Inputs
| Name | Description |
|---|---|
| options | Items to choose from — objects, or plain strings / numbers |
| optionLabel | Field of an item shown as its text; dots read nested fields |
| optionValue | Field of an item written into the value; empty string = the whole item |
| optionDisabled | Field that disables an item |
| group | `options` are groups with their own items |
| optionGroupLabel | Field of a group shown as its header |
| optionGroupChildren | Field of a group that holds its items |
| dataKey | Field that identifies an object value |
| multiple | Several values; the value is an array |
| checkbox | Shows a checkbox on each option (several values) |
| metaKeySelection | With `multiple`: a plain click replaces the selection, Ctrl / ⌘ + click adds |
| checkmark | Check icon on selected options without checkboxes (on by default) |
| filter | Shows a search field above the list |
| filterBy | Fields to search in, comma separated |
| filterMatchMode | `contains`, `startsWith`, `endsWith` or `equals` |
| filterPlaceholder | Own placeholder of the search field |
| filterDelay | Milliseconds to wait before `filtered` is emitted |
| loading | Shows "Loading" in an empty list |
| lazy | Options come from a server: `lazyLoad` asks for missing rows |
| virtualScroll | Renders only the visible rows |
| virtualScrollItemSize | Height of a row in px with `virtualScroll` |
| scrollHeight | Maximum height of the list |
| emptyMessage | Text of an empty list |
| emptyFilterMessage | Text when the search found nothing |
| ariaLabel | Accessible name of the list |
| ariaLabelledBy | Id of the element that names the list (`tx-field` sets it) |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the selection, does not change it |
| dt | Design tokens of this instance (`listbox`); options use the `select` tokens |
| pt | Classes and styles of the parts: `root`, `header`, `filter`, `filterInput`, `list`, `group`, `option`, `check`, `empty`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | The user changed the selection: `{ value, option }` |
| filtered | The search text changed: `{ query }` |
| lazyLoad | Rows without data came into view: `{ first, last, query }` |

## Slots
| Name | Description |
|---|---|
| txSelectOption | `<ng-template txSelectOption let-option let-selected="selected">` — own markup of an option |
| txSelectGroup | `<ng-template txSelectGroup let-group>` — own group header |
| txSelectHeader | `<ng-template txSelectHeader>` — content above the list |
| txSelectFooter | `<ng-template txSelectFooter>` — content below the list |
| txSelectEmpty | `<ng-template txSelectEmpty>` — own empty list |
| txSelectEmptyFilter | `<ng-template txSelectEmptyFilter let-query>` — shown when the search found nothing |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus into the list (or its search field) |
| ArrowDown / ArrowUp | Moves the active option, skipping disabled ones and group headers |
| Shift + ArrowDown / ArrowUp | With `multiple`: moves and adds the option |
| Home / End | First / last option (in the search field they move the caret) |
| PageDown / PageUp | Ten options down / up |
| Enter / Space | Selects the active option; toggles it with `multiple` (Space types in the search field) |
| Ctrl / ⌘ + A | With `multiple`: selects or clears all visible options |
| Letters | Jump to the option that starts with the typed text |
