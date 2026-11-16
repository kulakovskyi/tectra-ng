# SelectButton

A segmented choice: a few options as buttons in one track, the picked one filled. One value (a radio group) or several (`multiple`, toggle buttons). A `ControlValueAccessor` — works with `[formControl]`, `ngModel`, signal forms and `[(value)]`.

```html
<tx-select-button ariaLabel="Billing period" [options]="periods" formControlName="period" />
```

```ts
readonly periods = [
  { label: 'Monthly', value: 'month' },
  { label: 'Yearly', value: 'year' },
];
```

Options are objects (fields read with `optionLabel`, `optionValue`, `optionDisabled`, `optionIcon`; dots reach nested fields) or plain strings / numbers. The value is one option value or `null`; with `multiple` it is an array in the order the options were picked.

## Inputs
| Name | Description |
|---|---|
| value | Two-way: the selected value, or an array of values when `multiple` is on |
| options | The options: objects or plain strings / numbers |
| optionLabel | Field of the option text (default `label`) |
| optionValue | Field of the option value (default `value`); plain options are their own value |
| optionDisabled | Field that disables an option (default `disabled`) |
| optionIcon | Field of the option icon — a `@tectra-ng/icons` name or any icon class (default `icon`) |
| dataKey | Field that identifies object values, so a copy of a value still matches its option |
| multiple | Several options can be picked; the value is an array and the items are toggle buttons |
| allowEmpty | `false` = a click on the only picked option does not unpick it (default `true`) |
| iconOnly | Shows only the icons; the option text becomes the accessible name and a tooltip |
| size | `small`, `medium`, `large` |
| fluid | Takes the full width, the items share it equally; inherits `<tx-fluid>` |
| invalid | Red border and `aria-invalid`; without it the control follows its form control |
| disabled | Disables every option (the form control can disable it too) |
| readonly | Shows the value, ignores clicks; the arrow keys still move focus |
| required | `aria-required` on the radio group (single mode) |
| ariaLabel | Accessible name of the group |
| ariaLabelledBy | Id of the element that names the group |
| dt | Design tokens of this instance (`selectButton`) |
| pt | Classes and styles of the parts: `root`, `item`, `icon`, `label` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles, keeps the buttons, the keys and ARIA |

## Outputs
| Name | Description |
|---|---|
| changed | `{ value, option, originalEvent }` after a click or a key changed the value |
| focused | Focus came into the control |
| blurred | Focus left the control |

## Slots
| Name | Description |
|---|---|
| txSelectButtonItem | `<ng-template txSelectButtonItem let-option let-selected="selected">` — own content of each item; `[txSelectButtonItemOf]="options"` types `option` |

## Methods
| Name | Description |
|---|---|
| focus | Moves focus to the selected option, or to the first one that can be picked |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus into the control (to the selected option) and out of it |
| Arrow Right / Down | Moves to the next option, from the last back to the first; in single mode also selects it |
| Arrow Left / Up | Moves to the previous option, from the first to the last; in single mode also selects it |
| Home / End | Moves to the first / last option; in single mode also selects it |
| Space / Enter | Selects the focused option, or unpicks it when it is picked and `allowEmpty` is on; with `multiple` toggles it |

Disabled options are skipped. Single mode is a `radiogroup` of `radio` buttons with `aria-checked`; `multiple` is a `group` of buttons with `aria-pressed`. Both keep one Tab stop.
