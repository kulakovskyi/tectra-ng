# Multiselect

Pick several values from a list. The value is an array; works with `[formControl]`, `ngModel` and signal forms. Shares the option engine, keyboard and panel with `tx-select`: groups, search, virtual scroll, lazy loading and templates work the same.

Texts come from the tectra locale — `selectAll`, `selectedOfTotal`, `selectedItems`, `searchPlaceholder`, `emptyMessage`, `clear`. Override them for the whole app with `provideTectra({ translations: { selectAll: '…' } })`, switch languages at runtime with `TxLocaleService.setLocale(…)`, or set them on one field with `selectAllLabel`, `countLabel`, `selectedItemsLabel`, `filterPlaceholder`, `emptyMessage`.

## Inputs
| Name | Description |
|---|---|
| options | Items to choose from — objects, or plain strings / numbers; `null` / `undefined` items are rows still loading (`lazy`) |
| optionLabel | Field of an item shown as its text; dots read nested fields |
| optionValue | Field of an item written into the value; empty string = the whole item |
| optionDisabled | Field that disables an item |
| group | `options` are groups with their own items |
| optionGroupLabel | Field of a group shown as its header |
| optionGroupChildren | Field of a group that holds its items |
| dataKey | Field that identifies an object value |
| display | `comma` (text) or `chip` (removable chips) |
| maxSelectedLabels | Above this many values the field shows "N selected" |
| selectedItemsLabel | Own summary text, `{count}` is replaced |
| selectAllLabel | Own text of the select-all checkbox (the translated "Select all" by default) |
| countLabel | Own count text in the select-all row, `{selected}` and `{total}` are replaced |
| selectionLimit | Maximum number of values; other options turn disabled |
| showToggleAll | Checkbox that selects or clears all visible options (on by default): next to the search, or without it a full row with "Select all" and the count |
| placeholder | Text shown while nothing is selected |
| filter | Shows a search field at the top of the panel |
| filterBy | Fields to search in, comma separated |
| filterMatchMode | `contains`, `startsWith`, `endsWith` or `equals` |
| filterPlaceholder | Own placeholder of the search field |
| filterDelay | Milliseconds to wait before `filtered` is emitted |
| resetFilterOnHide | Clears the search when the panel closes |
| showClear | Shows a button that clears all values |
| loading | Spinner instead of the dropdown icon |
| lazy | Options come from a server: `lazyLoad` asks for missing rows |
| virtualScroll | Renders only the visible rows |
| virtualScrollItemSize | Height of a row in px with `virtualScroll` |
| scrollHeight | Maximum height of the list |
| emptyMessage | Text of an empty list |
| emptyFilterMessage | Text when the search found nothing |
| dropdownIcon | Icon name of the dropdown indicator |
| inputId | Id of the field for a `<label for>` |
| ariaLabel | Accessible name of the field |
| ariaLabelledBy | Id of the element that labels the field |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the values, does not open |
| dt | Design tokens of this instance (`select`) |
| pt | Classes and styles of the parts: the select parts plus `chip`, `toggleAll` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | A value was added or removed: `{ value, option, selected }` (`option` is `null` for select all / clear) |
| cleared | The clear button was used |
| filtered | The search text changed: `{ query }` |
| lazyLoad | Rows without data came into view: `{ first, last, query }` |
| opened | The panel was opened |
| closed | The panel was closed (the control is marked as touched) |

## Slots
| Name | Description |
|---|---|
| txSelectOption | `<ng-template txSelectOption let-option let-selected="selected">` — own markup of an option |
| txSelectValue | `<ng-template txSelectValue let-items>` — own markup of the field; gets the selected items (`label`, `value`, `option`) |
| txSelectGroup | `<ng-template txSelectGroup let-group>` — own group header |
| txSelectHeader | `<ng-template txSelectHeader>` — content above the list |
| txSelectFooter | `<ng-template txSelectFooter>` — content below the list |
| txSelectEmpty | `<ng-template txSelectEmpty>` — own empty list |
| txSelectEmptyFilter | `<ng-template txSelectEmptyFilter let-query>` — shown when the search found nothing |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Opens the panel, toggles the active option; the panel stays open |
| ArrowDown / ArrowUp | Opens the panel, moves the active option |
| Home / End | First / last option |
| PageDown / PageUp | Ten options down / up |
| Ctrl / ⌘ + A | Selects or clears all visible options |
| Backspace | With `display="chip"` on a closed field, removes the last value |
| Letters | Jump to the option that starts with the typed text |
| Escape | Closes the panel and returns focus to the field |
| Tab | Moves to the select-all checkbox and other panel actions, then closes the panel |
