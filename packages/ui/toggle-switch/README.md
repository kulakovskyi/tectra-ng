# Toggle switch

An on / off setting that applies at once. A native checkbox with `role="switch"`: Space toggles, the label toggles, screen readers announce "on" / "off".

```html
<tx-toggle-switch label="Email notifications" formControlName="notify" />
```

## Inputs
| Name | Description |
|---|---|
| label | Text of the label; content inside the tag is added after it |
| description | Muted text under the label, linked with `aria-describedby` |
| labelPosition | `end` (label after the switch) or `start` (before it) |
| trueValue | Model value when on |
| falseValue | Model value when off |
| onIcon | Icon inside the handle when on |
| offIcon | Icon inside the handle when off |
| size | `small`, `medium`, `large` |
| invalid | Red ring; without it the switch follows its form control |
| disabled | Disables the switch (also from the form control) |
| readonly | Shows the value, ignores clicks |
| required | Native `required` |
| name | Native `name` |
| inputId | Id of the native input, for an outside `<label for>` |
| ariaLabel | Accessible name when there is no visible label |
| ariaLabelledBy | Id of the element that names the switch |
| tabindex | Tab order of the native input |
| dt | Design tokens of this instance (`toggleSwitch`) |
| pt | Classes and styles of the parts: `root`, `track`, `input`, `handle`, `label`, `description` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles, keeps the native input |

## Outputs
| Name | Description |
|---|---|
| changed | `{ checked, value, originalEvent }` after a toggle |

## Slots
| Name | Description |
|---|---|
| default | Extra label content |
| txToggleSwitchHandle | `<ng-template txToggleSwitchHandle let-checked>` — content of the handle |

## Keyboard
| Key | Action |
|---|---|
| Space | Toggles the switch |
| Tab | Moves to the next control |
