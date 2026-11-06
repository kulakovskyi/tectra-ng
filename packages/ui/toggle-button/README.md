# ToggleButton

A button that stays pressed: on / off with its own label and icon for each state. A `ControlValueAccessor` for a `boolean` — works with `[formControl]`, `ngModel` and signal forms.

## Inputs
| Name | Description |
|---|---|
| onLabel | Text while on |
| offLabel | Text while off |
| onIcon | Icon while on — a `@tectra-ng/icons` name or any icon class (`pi pi-check`) |
| offIcon | Icon while off |
| iconPos | Icon on the `left` or `right` of the text |
| size | `small`, `medium`, `large` |
| allowEmpty | `false` = once on, a click cannot turn it off |
| invalid | Red border and `aria-invalid` |
| fluid | Takes the full width of its container; inherits `<tx-fluid>` |
| disabled | `disabled` — blocks the button (the form control can disable it too) |
| tabindex | Tab order of the inner button |
| ariaLabel | Accessible name when the label is not enough |
| dt | Design tokens of this one button |
| pt | Extra `class` / `style` for `root`, `content`, `icon`, `label` — an object or a function `({ instance }) => ({ class, style })`, e.g. depending on `instance.checked()` |
| ptOptions | How this `pt` meets the global one from `provideTectra({ pt })`: `mergeSections` (default `true` — keep global parts this `pt` does not mention), `mergeProps` (default `false` — a local part replaces the global one; `true` joins classes and styles) |
| unstyled | Drops all tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | `{ originalEvent, checked }` after a click changed the value |

## Keyboard
| Key | Action |
|---|---|
| Space / Enter | Toggles the state |
| Tab | Moves focus to the button |
