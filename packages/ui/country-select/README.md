# Country select

Pick one country or several. Built on `tx-select` and `tx-multiselect`: every ISO country by default (or your own list), names in the current tectra locale sorted for that language, flags, search by name or code, counts and hints, a virtual list for long lists. With several countries the field shows a few flags and "+N". The value is the code (or your `value`), an array with `multiple`.

## Inputs
| Name | Description |
|---|---|
| options | Countries to offer: codes, or `{ code, value?, label?, count?, hint?, disabled? }`; all countries by default |
| multiple | Several countries; the value is an array |
| filter | Search by name or code (on by default) |
| sort | `name` (localized, by default) or `none` (keep the order of `options`) |
| shape | Flag shape: `rectangle` or `circle` |
| maxFlags | With `multiple`: flags shown in the field before "+N" |
| virtualScrollThreshold | Above this many countries the list is virtual |
| placeholder | Text shown while nothing is selected |
| showClear | Shows a button that clears the value |
| loading | Spinner instead of the dropdown icon |
| inputId | Id of the field for a `<label for>` |
| ariaLabel | Accessible name of the field |
| ariaLabelledBy | Id of the element that labels the field |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the value, does not open |
| dt | Design tokens of this instance (`select`) |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | The user changed the value |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Opens the panel, picks (or toggles with `multiple`) the active country |
| ArrowDown / ArrowUp | Opens the panel, moves the active country |
| Letters | Typed in the search field: finds by name or code |
| Escape | Closes the panel |
