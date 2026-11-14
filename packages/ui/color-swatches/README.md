# ColorSwatches

A radio group of color dots: picks one value from a few colors — a theme color, a label color, a calendar color. The picked dot gets a ring and a check mark. A `ControlValueAccessor` — works with `[formControl]`, `ngModel` and signal forms.

```html
<tx-color-swatches ariaLabel="Label color" [options]="colors" formControlName="color" />
```

```ts
readonly colors: TxColorSwatchOption[] = [
  { value: 'red', color: '#ef4444', label: 'Red' },
  { value: 'green', color: '#22c55e', label: 'Green' },
];
```

The value is the `value` of the picked option; any CSS color works for `color`. The `label` names the dot for screen readers and shows as its tooltip.

## Inputs
| Name | Description |
|---|---|
| options | The dots: `{ value, color, label, disabled? }` |
| columns | Number of dots per row; without it the dots wrap to the width |
| size | `small`, `medium`, `large` |
| invalid | Red rings and `aria-invalid`; without it the control follows its form control |
| disabled | Disables every dot (also from the form control) |
| readonly | Shows the value, ignores clicks; the arrow keys still move focus |
| ariaLabel | Accessible name of the group |
| ariaLabelledBy | Id of the element that names the group |
| dt | Design tokens of this instance (`colorSwatches`) |
| pt | Classes and styles of the parts: `root`, `group`, `swatch`, `check` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | `{ value, originalEvent }` after a click or a key picked a dot |

## Methods
| Name | Description |
|---|---|
| focus | Moves focus to the picked dot, or to the first one that can be picked |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus into the group (to the picked dot) and out of it |
| Arrow Right / Down | Picks the next dot, from the last back to the first |
| Arrow Left / Up | Picks the previous dot, from the first to the last |
| Home / End | Picks the first / last dot |
| Space | Picks the focused dot |

Disabled dots are skipped.
