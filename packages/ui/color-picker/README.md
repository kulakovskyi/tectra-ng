# Color picker

Pick a colour in a popover or inline: a saturation / brightness area, a hue slider, a hex field and preset swatches. Every part works from the keyboard. The value is a hex string by default (`#3366cc`), or an `{ r, g, b }` / `{ h, s, b }` object; works with `[formControl]`, `ngModel` and signal forms. Also exports `parseHex`, `rgbToHex`, `rgbToHsb`, `hsbToRgb`.

## Inputs
| Name | Description |
|---|---|
| format | `hex`, `rgb` or `hsb` — the type of the value |
| inline | Shows the panel in place instead of a button with a popover |
| presets | Hex colours shown as swatches |
| showClear | Button that removes the colour (`null`) |
| showInput | Hex field in the panel (on by default) |
| showValue | Hex text next to the swatch on the button (on by default) |
| placeholder | Text on the button without a colour |
| inputId | Id of the button for a `<label for>` |
| ariaLabel | Accessible name of the button and the panel |
| ariaLabelledBy | Id of the element that labels the button |
| size | `small`, `medium`, `large` |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Shows the colour, cannot change it |
| dt | Design tokens of this instance (`colorPicker`) |
| pt | Classes and styles of the parts: `root`, `trigger`, `swatch`, `panel`, `area`, `hue`, `input`, `presets`, `preset`, `clear` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | The user changed the colour (`null` when cleared) |
| opened | The popover was opened |
| closed | The popover was closed (the control is marked as touched) |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the button: opens the popover, focus goes to the area |
| ArrowLeft / ArrowRight | Area: saturation − / +; hue slider: hue − / + |
| ArrowUp / ArrowDown | Area: brightness + / −; hue slider: hue + / − |
| Shift + arrows | Steps of 10 |
| PageUp / PageDown | Brightness or hue by 10 |
| Home / End | Area: no / full saturation; hue slider: 0 / 360 |
| Tab | Moves between the area, the hue slider, the hex field and the presets; leaving the popover closes it |
| Escape | Closes the popover and returns focus to the button |
