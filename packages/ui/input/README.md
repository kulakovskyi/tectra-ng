# Input

Styles a native `input` or `textarea` with the shared `formField` tokens (also used by select, password, number…). Native `readonly` and `disabled` are styled too. Works with `[formControl]`, `ngModel` and signal forms as is — it is the native element.

## Inputs
| Name | Description |
|---|---|
| invalid | Red border and `aria-invalid`. Without it the field follows its form control: invalid once touched or changed |
| size | `small`, `medium`, `large` |
| variant | `outlined` (border) or `filled` (tinted background) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus to the field (native behaviour) |
