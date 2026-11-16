# Chips input

A text field that turns what you type into chips — keywords, tags, emails, domains. The value is an array of strings; works with `[formControl]`, `ngModel` and signal forms.

## Inputs
| Name | Description |
|---|---|
| text | Typed text that is not a chip yet; two-way with `[(text)]` — setting it updates the field |
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
| textChange | The typed text changed |

## Methods
| Name | Description |
|---|---|
| add(value) | Adds a chip or a list of chips with the same checks as typing (duplicates, `max`, `maxLength`, `itemPattern`); emits `added` / `rejected`; does nothing when disabled or read-only. The typed text stays |
| clearText() | Clears the typed text and keeps the chips |
| clear() | Removes every chip and the typed text |
| removeAt(index) | Removes the chip at the index |

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
