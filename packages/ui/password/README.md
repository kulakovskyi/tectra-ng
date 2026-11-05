# Password

A password field: show / hide the text, a strength meter while typing, a clear button. The meter's levels, labels and rules are yours to change, and templates add a requirements list.

```html
<tx-password formControlName="password" [toggleMask]="true" />
<tx-password formControlName="newPassword" [feedback]="true" [toggleMask]="true" autocomplete="new-password" />
```

## Inputs
| Name | Description |
|---|---|
| feedback | Shows the strength meter under the field while it has focus |
| toggleMask | Adds a button that shows or hides the password |
| showClear | Adds a clear button when there is text |
| placeholder | Placeholder of the input |
| promptLabel | Meter text before typing (translated by default) |
| weakLabel | Meter text for a weak password |
| mediumLabel | Meter text for a medium password |
| strongLabel | Meter text for a strong password |
| mediumRegex | Rule for a medium password (string or RegExp); default: 6+ characters with two of lower case, upper case, digits |
| strongRegex | Rule for a strong password; default: 8+ characters with lower case, upper case and a digit |
| autocomplete | Native `autocomplete`: `current-password` (default) for sign-in, `new-password` for sign-up |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| fluid | Takes the full width of its container; inherits `<tx-fluid>` |
| invalid | Red border; without it the field follows its form control |
| disabled | Disables the field (also from the form control) |
| readonly | Shows the value, no editing |
| required | Native `required` |
| maxlength | Native `maxlength` |
| name | Native `name` |
| inputId | Id of the input, for an outside `<label for>` or a float label |
| ariaLabel | Accessible name when there is no visible label |
| ariaLabelledBy | Id of the element that names the field |
| tabindex | Tab order of the input |
| dt | Design tokens of this instance (`password`); the field itself uses `formField` |
| pt | Classes and styles of the parts: `root`, `input`, `toggle`, `clear`, `panel`, `meter`, `info` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| strengthChange | `weak`, `medium`, `strong`, or `null` when empty |
| cleared | The clear button emptied the field |

## Slots
| Name | Description |
|---|---|
| txPasswordHeader | `<ng-template txPasswordHeader let-strength let-value="value">` — above the meter |
| txPasswordContent | `<ng-template txPasswordContent let-strength let-value="value">` — under the meter, e.g. a requirements list |
| txPasswordFooter | `<ng-template txPasswordFooter let-strength let-value="value">` — at the bottom of the panel |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves from the field to the show / hide and clear buttons |
| Enter / Space | Shows or hides the password from the toggle button |
| Escape | Closes the strength meter |
