# Field

A form row: label, control, hint and error in one element. It finds the control inside (input, textarea, select, `tx-select`, checkbox, switch, slider…), gives it an id when it has none, points the label at it and adds the hint and the error to its `aria-describedby`. A group (`tx-radio-group`, `tx-checkbox-group`, any `role="radiogroup"` / `role="group"`) is named by the label through `aria-labelledby` instead. The error comes from the projected `formControl` / `formControlName` / `ngModel`, or from `control`; `errorText` shows an error from outside the form and turns the control red.

```html
<tx-field label="Email" required hint="We never share it">
  <input txInput type="email" formControlName="email" />
</tx-field>

<tx-field label="Plan" layout="horizontal" [errorText]="serverError()">
  <tx-select [options]="plans" formControlName="plan" />
</tx-field>
```

## Inputs
| Name | Description |
|---|---|
| label | Text of the label |
| required | Required mark after the label (also put `required` / `Validators.required` on the control) |
| colon | Adds `:` after the label |
| subtle | Smaller, muted label — for filters and dense forms |
| tooltip | Help icon after the label with this hint |
| hint | Help text under the control |
| control | Form control for the error, when it is not the projected one |
| errorText | Error from outside the form (e.g. the server); shown before the control's errors and marks the control invalid |
| successText | Text shown when the control has a valid value and was touched or changed |
| messages | Own error texts per error key (see `tx-field-error`) |
| showImmediately | Shows the error before the control is touched or changed |
| layout | `vertical` (label above) or `horizontal` (label on the left, stacks below 40rem) |
| dt | Design tokens of this instance (`field`) |
| pt | Classes and styles of the parts: `root`, `label`, `control`, `hint`, `error` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles, keeps the wiring |

## Slots
| Name | Description |
|---|---|
| default | The control |

## Keyboard
| Key | Action |
|---|---|
| Click on the label | Focuses the control |
