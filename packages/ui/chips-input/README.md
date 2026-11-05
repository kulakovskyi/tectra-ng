# Chips input

A text field that turns what you type into chips — keywords, tags, emails, domains. The value is an array of strings; works with `[formControl]`, `ngModel` and signal forms.

## Inputs
| Name | Description |
|---|---|
| placeholder | Text shown while the field is empty |
| separator | Text or pattern that ends a chip while typing and splits pasted text (`,` by default); Enter always adds |
| addOnBlur | Adds the typed text when the field loses focus (on by default) |
| allowDuplicate | Allows the same value twice |
| caseSensitive | Compares values with case when looking for duplicates |
| max | Maximum number of chips; the field becomes read-only when full |
| maxLength | Maximum length of one chip |
| itemPattern | Values that do not match are rejected (`rejected` output) |
| showClear | Shows a button that removes all chips |
| inputId | Id of the text field for a `<label for>` |
| ariaLabel | Accessible name of the text field |
| ariaLabelledBy | Id of the element that labels the field |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the chips, cannot change them |
| dt | Design tokens of this instance (`chipsInput`) |
| pt | Classes and styles of the parts: `root`, `list`, `chip`, `input`, `clear` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| added | A chip was added: `{ value, values }` |
| removed | A chip was removed: `{ value, values }` |
| rejected | A value was not added — duplicate, over `max` or not matching `itemPattern`: `{ value, values }` |

## Slots
| Name | Description |
|---|---|
| txChipsInputItem | `<ng-template txChipsInputItem let-item let-index="index">` — own content of a chip |

## Keyboard
| Key | Action |
|---|---|
| Enter / separator | Adds the typed text as a chip |
| Backspace | In an empty field, removes the last chip |
| Tab | Moves to the remove buttons of the chips; Delete / Backspace or Enter there removes the chip |
| Ctrl / ⌘ + V | Pasted text is split into chips by lines and the separator |
