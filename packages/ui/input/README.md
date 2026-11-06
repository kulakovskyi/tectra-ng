# Input

Styles a native `input` or `textarea` with the shared `formField` tokens (also used by select, password, number…). Native `readonly` and `disabled` are styled too. Works with `[formControl]`, `ngModel` and signal forms as is — it is the native element.

## Inputs
| Name | Description |
|---|---|
| invalid | Red border and `aria-invalid`. Without it the field follows its form control: invalid once touched or changed |
| size | `small`, `medium`, `large` |
| variant | `outlined` (border) or `filled` (tinted background) |
| fluid | Takes the full width of its container; inherits `<tx-fluid>` |
| dt | `formField` design tokens of this one field |
| pt | Extra `class` / `style` on the `root` (the input itself) |
| ptOptions | How this `pt` meets the global one |
| unstyled | Drops all tectra styles |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus to the field (native behaviour) |

Icons, prefix / suffix, clear and copy buttons: `@tectra-ng/ui/icon-field`. Addons: `@tectra-ng/ui/input-group`. Allowed characters: `@tectra-ng/ui/key-filter`.
