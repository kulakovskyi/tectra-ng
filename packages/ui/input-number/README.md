# Input number

A number field that formats as you type — group separators, decimals and currency of the current locale — with step buttons, keyboard steps and limits. The model is a `number` (or `null`).

```html
<tx-input-number formControlName="price" mode="currency" currency="UAH" [min]="0" />
<tx-input-number formControlName="seats" [showButtons]="true" [min]="1" [max]="50" />
```

## Inputs
| Name | Description |
|---|---|
| mode | `decimal` or `currency` |
| currency | ISO currency code for `currency` mode, e.g. `USD`, `EUR`, `UAH` |
| currencyDisplay | `symbol`, `narrowSymbol`, `code` or `name` |
| locale | Locale of the formatting; the current tectra locale by default |
| useGrouping | Thousands separators |
| minFractionDigits | Fraction digits always shown after the field loses focus |
| maxFractionDigits | Fraction digits allowed while typing (3 for decimals, the currency's own for money) |
| prefix | Text before the number, e.g. `~` |
| suffix | Text after the number, e.g. ` kg` |
| min | Smallest value; also blocks the minus sign when it is 0 or more |
| max | Largest value |
| step | Step of the buttons and the arrow keys |
| showButtons | Shows increment / decrement buttons; hold to repeat |
| buttonLayout | `stacked` (inside the field), `horizontal` (minus left, plus right) or `vertical` |
| incrementIcon | Icon of the increment button |
| decrementIcon | Icon of the decrement button |
| allowEmpty | Allows an empty value; off — an empty field becomes `min` or 0 |
| showClear | Adds a clear button when there is a value |
| placeholder | Placeholder of the input |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| fluid | Takes the full width of its container; inherits `<tx-fluid>` |
| invalid | Red border; without it the field follows its form control |
| disabled | Disables the field (also from the form control) |
| readonly | Shows the value, no editing or steps |
| required | Native `required` |
| name | Native `name` |
| inputId | Id of the input, for an outside `<label for>` or a float label |
| ariaLabel | Accessible name when there is no visible label |
| ariaLabelledBy | Id of the element that names the field |
| tabindex | Tab order of the input |
| dt | Design tokens of this instance (`inputNumber`); the field itself uses `formField` |
| pt | Classes and styles of the parts: `root`, `input`, `increment`, `decrement`, `clear` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | `{ value, originalEvent }` after typing, a step or clearing |
| cleared | The clear button emptied the field |

## Keyboard
| Key | Action |
|---|---|
| Arrow Up / Down | Adds / subtracts `step` within `min` and `max` |
| Home / End | Sets `min` / `max` when they are defined |
| Enter | Applies the limits and formats the value |
| `.` or `,` | Starts the fraction (both work when the locale uses a comma) |
