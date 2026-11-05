# Checkbox

A checkbox on a native `<input type="checkbox">`: one boolean, a value in an array, or a group with "select all". Space toggles, the label toggles, screen readers hear the native control.

```html
<tx-checkbox label="Send me the weekly report" formControlName="report" />

<tx-checkbox-group formControlName="permissions" [selectAll]="true" ariaLabel="Permissions">
  <tx-checkbox value="read" label="Read" />
  <tx-checkbox value="write" label="Write" />
</tx-checkbox-group>
```

Without `value` the checkbox is binary (`trueValue` / `falseValue`). With `value` it adds or removes that value in an array — its own form control, or the one of `tx-checkbox-group`.

## Inputs
| Name | Description |
|---|---|
| label | Text of the label; content inside the tag is added after it |
| description | Muted text under the label, linked with `aria-describedby` |
| value | Value added to the array when checked (group / array mode) |
| binary | Forces binary mode even with a `value` |
| trueValue | Binary mode: model value when checked |
| falseValue | Binary mode: model value when not checked |
| indeterminate | Mixed state (`aria-checked="mixed"`); clears on the next click |
| icon | Icon of the checked state |
| indeterminateIcon | Icon of the mixed state |
| size | `small`, `medium`, `large` (inherits the group) |
| variant | `outlined` or `filled` (inherits the group) |
| tile | Option tile look: the whole card toggles, with a border and a checked background |
| invalid | Red border; without it the checkbox follows its form control |
| disabled | Disables the checkbox (also from the form control or the group) |
| readonly | Shows the value, ignores clicks |
| required | Native `required` |
| name | Native `name` (inherits the group) |
| inputId | Id of the native input, for an outside `<label for>` |
| ariaLabel | Accessible name when there is no visible label |
| ariaLabelledBy | Id of the element that names the checkbox |
| tabindex | Tab order of the native input |
| selectAll | `tx-checkbox-group`: adds a "select all" checkbox above, mixed when some are checked |
| selectAllLabel | `tx-checkbox-group`: text of "select all" (translated by default) |
| orientation | `tx-checkbox-group`: `vertical` or `horizontal` |
| dt | Design tokens of this instance (`checkbox`) |
| pt | Classes and styles of the parts: `root`, `box`, `input`, `icon`, `label`, `description`; group: `root`, `selectAll`, `items` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles, keeps the native input |

## Outputs
| Name | Description |
|---|---|
| changed | Checkbox: `{ checked, value, originalEvent }` after a toggle; group: the new array |
| indeterminateChange | The mixed state was cleared by a click |

## Slots
| Name | Description |
|---|---|
| default | Checkbox: extra label content; group: the checkboxes |
| txCheckboxIcon | `<ng-template txCheckboxIcon let-checked let-indeterminate="indeterminate">` — own indicator icon |

## Keyboard
| Key | Action |
|---|---|
| Space | Toggles the focused checkbox |
| Tab | Moves to the next checkbox |
