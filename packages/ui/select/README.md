# Select

Pick one value from a list. A `ControlValueAccessor`: works with `[formControl]`, `ngModel` and signal forms. The panel is a CDK overlay, so it is never cut by `overflow: hidden` and flips up at the bottom of the screen.

## Inputs
| Name | Description |
|---|---|
| options | Items to choose from — any objects |
| optionLabel | Field of an item shown as its text |
| optionValue | Field of an item written into the form value; empty string = the whole item |
| placeholder | Text shown while nothing is selected |
| filter | Shows a search field at the top of the panel |
| ariaLabel | Accessible name of the field; the placeholder is used when it is empty |
| ariaLabelledBy | Id of the element that labels the field (e.g. a `<label>`) |
| size | `small`, `medium`, `large` |
| variant | `outlined` (border) or `filled` (tinted background) |
| invalid | Red border and `aria-invalid`. Without it the select follows its form control: invalid once touched or changed |
| readonly | Shows the value, does not open |

## Outputs
| Name | Description |
|---|---|
| opened | The panel was opened |
| closed | The panel was closed (the control is marked as touched) |

## Slots
| Name | Description |
|---|---|
| txSelectOption | `<ng-template txSelectOption let-option>` — own markup of an option and of the selected value |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Opens the panel, selects the active option |
| ArrowDown / ArrowUp | Opens the panel, moves the active option |
| Home / End | First / last option |
| PageDown / PageUp | Ten options down / up |
| Letters | Jump to the option that starts with the typed text; on a closed select, choose it |
| Escape | Closes the panel and returns focus to the field |
| Tab | Closes the panel and moves focus on |
