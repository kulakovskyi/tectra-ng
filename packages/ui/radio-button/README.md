# Radio button

One choice out of a few, on native `<input type="radio">`. Put the options in `tx-radio-group` — it holds the value, gives them one `name` and is the `radiogroup` for screen readers; arrow keys move between the options, Tab leaves the group.

```html
<tx-radio-group formControlName="plan" ariaLabel="Plan">
  <tx-radio-button value="free" label="Free" />
  <tx-radio-button value="team" label="Team" description="Up to 20 people" />
</tx-radio-group>
```

A radio button also works alone with a form control: it is checked when the control equals its `value`.

## Inputs
| Name | Description |
|---|---|
| value | Value of this option |
| label | Text of the label; content inside the tag is added after it |
| description | Muted text under the label, linked with `aria-describedby` |
| size | `small`, `medium`, `large` (inherits the group) |
| variant | `outlined` or `filled` (inherits the group) |
| tile | Option tile look: the whole card selects |
| invalid | Red border; without it the radio follows its form control or the group |
| disabled | Disables the option, or with the group every option |
| readonly | Shows the value, ignores clicks |
| required | Native `required` (the group sets it on every option) |
| name | Native `name`; the group generates one when not set |
| inputId | Id of the native input, for an outside `<label for>` |
| ariaLabel | Accessible name when there is no visible label; on the group, its name |
| ariaLabelledBy | Id of the element that names the option or the group |
| tabindex | Tab order of the native input |
| orientation | `tx-radio-group`: `vertical` or `horizontal` |
| dt | Design tokens of this instance (`radioButton`) |
| pt | Classes and styles of the parts: `root`, `box`, `input`, `dot`, `label`, `description`; group: `root` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles, keeps the native inputs |

## Outputs
| Name | Description |
|---|---|
| changed | Radio: `{ value, originalEvent }` when chosen; group: the new value |

## Slots
| Name | Description |
|---|---|
| default | Radio: extra label content; group: the radio buttons |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves into the group (to the checked option) and out of it |
| Arrow Down / Right | Checks the next option |
| Arrow Up / Left | Checks the previous option |
| Space | Checks the focused option |
