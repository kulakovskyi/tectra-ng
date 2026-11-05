# Select

Pick one value from a list. A `ControlValueAccessor`: works with `[formControl]`, `ngModel` and signal forms. The panel is a CDK overlay, so it is never cut by `overflow: hidden` and flips up at the bottom of the screen. Long lists scroll virtually and can load page by page from a server.

The option engine (`buildOptionRows`, `readOptionField`, `foldText`) is exported for other list controls.

## Inputs
| Name | Description |
|---|---|
| options | Items to choose from — objects, or plain strings / numbers. `null` / `undefined` items are rows that are still loading (`lazy`) |
| optionLabel | Field of an item shown as its text; dots read nested fields (`user.name`) |
| optionValue | Field of an item written into the form value; empty string = the whole item |
| optionDisabled | Field that disables an item — keys, typing and clicks skip it |
| group | `options` are groups with their own items |
| optionGroupLabel | Field of a group shown as its header |
| optionGroupChildren | Field of a group that holds its items |
| dataKey | Field that identifies an object value, so a value that is a copy of an option is still found |
| placeholder | Text shown while nothing is selected |
| filter | Shows a search field at the top of the panel |
| filterBy | Fields to search in, comma separated; the label by default |
| filterMatchMode | `contains`, `startsWith`, `endsWith` or `equals`; case and accents are ignored |
| filterPlaceholder | Own placeholder of the search field |
| filterDelay | Milliseconds to wait after typing before `filtered` is emitted — for server search |
| resetFilterOnHide | Clears the search when the panel closes |
| showClear | Shows a button that clears the value |
| editable | The field is a text input: free text is the value, unless it matches an option |
| loading | Spinner instead of the dropdown icon, "Loading" in an empty panel |
| checkmark | Check icon on the selected option (off by default; the selected option is highlighted) |
| lazy | Options come from a server: `lazyLoad` asks for missing rows and the search is not applied locally |
| virtualScroll | Renders only the visible rows — for long lists |
| virtualScrollItemSize | Height of a row in px with `virtualScroll` |
| scrollHeight | Maximum height of the list, e.g. `320px` |
| emptyMessage | Text of an empty list |
| emptyFilterMessage | Text when the search found nothing |
| dropdownIcon | Icon name of the dropdown indicator |
| inputId | Id of the field, so a `<label for>` (or `tx-float-label`) names it |
| ariaLabel | Accessible name of the field; without it and without a label, the placeholder is used |
| ariaLabelledBy | Id of the element that labels the field (e.g. a `<label>`) |
| size | `small`, `medium`, `large` |
| variant | `outlined` (border) or `filled` (tinted background) |
| invalid | Red border and `aria-invalid`. Without it the select follows its form control: invalid once touched or changed |
| readonly | Shows the value, does not open |
| dt | Design tokens of this instance (`select`), also applied to the panel |
| pt | Classes and styles of the parts: `root`, `box`, `trigger`, `value`, `clear`, `dropdown`, `panel`, `header`, `filter`, `filterInput`, `list`, `group`, `option`, `check`, `empty`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles of the field and the panel |

## Outputs
| Name | Description |
|---|---|
| changed | The user picked, typed or cleared a value: `{ value, option }` |
| cleared | The clear button was used |
| filtered | The search text changed: `{ query }` (after `filterDelay`) |
| lazyLoad | Rows without data came into view: `{ first, last, query }` — load them and replace the items |
| opened | The panel was opened |
| closed | The panel was closed (the control is marked as touched) |

## Slots
| Name | Description |
|---|---|
| txSelectOption | `<ng-template txSelectOption let-option let-selected="selected">` — own markup of an option (and of the value, without `txSelectValue`) |
| txSelectValue | `<ng-template txSelectValue let-option>` — own markup of the selected value in the field |
| txSelectGroup | `<ng-template txSelectGroup let-group>` — own group header |
| txSelectHeader | `<ng-template txSelectHeader>` — content above the list |
| txSelectFooter | `<ng-template txSelectFooter>` — content below the list, e.g. an "Add" button |
| txSelectEmpty | `<ng-template txSelectEmpty>` — own empty list |
| txSelectEmptyFilter | `<ng-template txSelectEmptyFilter let-query>` — shown when the search found nothing, e.g. "Create «query»" |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Opens the panel, selects the active option (Space types in the search and in an editable field) |
| ArrowDown / ArrowUp | Opens the panel, moves the active option, skipping disabled ones and group headers |
| Home / End | First / last option (in a text field they move the caret) |
| PageDown / PageUp | Ten options down / up |
| Letters | Jump to the option that starts with the typed text; on a closed select, choose it |
| Escape | Closes the panel and returns focus to the field |
| Tab | Closes the panel and moves focus on (to the clear button when it is shown) |
