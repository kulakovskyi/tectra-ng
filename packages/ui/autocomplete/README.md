# Autocomplete

A text field that suggests values while you type. Free text, or only a suggestion with `forceSelection`; one value or several as chips. You load the suggestions in `completed` (from a server or a local list), or let the field search a fixed list with `localSearch`. Works with `[formControl]`, `ngModel` and signal forms.

## Inputs
| Name | Description |
|---|---|
| suggestions | Items to suggest — objects, or plain strings / numbers |
| optionLabel | Field of an item shown as its text and written into the field |
| optionValue | Field of an item written into the value; empty string = the whole item |
| optionDisabled | Field that disables an item |
| group | `suggestions` are groups with their own items |
| optionGroupLabel | Field of a group shown as its header |
| optionGroupChildren | Field of a group that holds its items |
| dataKey | Field that identifies an object value |
| multiple | Several values shown as chips; the value is an array |
| dropdown | Button that shows suggestions without typing |
| dropdownMode | `blank` (asks with an empty query) or `current` (with the typed text) |
| dropdownIcon | Icon name of the dropdown button |
| forceSelection | Only a suggestion can be the value; other text is cleared when the field is left |
| localSearch | Filters `suggestions` by the typed text itself (use `filterMatchMode`, `filterBy`) |
| filterBy | Fields to search in with `localSearch`, comma separated |
| filterMatchMode | `contains`, `startsWith`, `endsWith` or `equals` with `localSearch` |
| delay | Milliseconds to wait after typing before `completed` |
| minLength | Characters needed before `completed` |
| completeOnFocus | Asks for suggestions as soon as the field gets focus |
| autoOptionFocus | Makes the first suggestion active, so Enter takes it |
| showEmptyMessage | Shows "No results" when there are no suggestions (on by default) |
| maxlength | Maximum length of the typed text |
| placeholder | Text shown in an empty field |
| showClear | Shows a button that clears the field |
| loading | Spinner in the field and "Loading" in an empty panel |
| lazy | Suggestions come page by page: `lazyLoad` asks for missing rows |
| virtualScroll | Renders only the visible rows |
| virtualScrollItemSize | Height of a row in px with `virtualScroll` |
| scrollHeight | Maximum height of the list |
| emptyMessage | Text when there are no suggestions |
| emptyFilterMessage | Text when the typed text found nothing |
| inputId | Id of the input for a `<label for>` |
| ariaLabel | Accessible name of the field |
| ariaLabelledBy | Id of the element that labels the field |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the value, cannot be changed |
| resetFilterOnHide | Clears the typed text when the panel closes |
| dt | Design tokens of this instance (`select`) |
| pt | Classes and styles of the parts: the select parts plus `input`, `chip`, `dropdownButton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| completed | Load suggestions for `{ query }` |
| changed | The value changed: `{ value, option, selected }` |
| cleared | The clear button was used |
| lazyLoad | Rows without data came into view: `{ first, last, query }` |
| opened | The panel was opened |
| closed | The panel was closed (the control is marked as touched) |

## Slots
| Name | Description |
|---|---|
| txSelectOption | `<ng-template txSelectOption let-option>` — own markup of a suggestion and of a chip |
| txSelectGroup | `<ng-template txSelectGroup let-group>` — own group header |
| txSelectHeader | `<ng-template txSelectHeader>` — content above the list |
| txSelectFooter | `<ng-template txSelectFooter>` — content below the list |
| txSelectEmpty | `<ng-template txSelectEmpty>` — shown when there are no suggestions |
| txSelectEmptyFilter | `<ng-template txSelectEmptyFilter let-query>` — shown when the typed text found nothing |

## Keyboard
| Key | Action |
|---|---|
| Letters | Type; suggestions are asked for after `delay` |
| ArrowDown / ArrowUp | Opens the suggestions, moves the active one |
| Enter | Takes the active suggestion; without one, keeps the typed text |
| PageDown / PageUp | Ten suggestions down / up |
| Home / End | Move the caret in the field |
| Backspace | With `multiple` in an empty field, removes the last chip |
| Escape | Closes the suggestions |
| Tab | Closes the suggestions and moves on; with `forceSelection` text that is not a suggestion is cleared |
