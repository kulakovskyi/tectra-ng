# Slider

Picks a number, or a range of two, by dragging a handle along a track. Each handle is a `slider` for screen readers and the keyboard. Horizontal or vertical, with step marks and labelled marks.

```html
<tx-slider formControlName="volume" ariaLabel="Volume" />
<tx-slider formControlName="price" [range]="true" [min]="0" [max]="500" [step]="10" ariaLabel="Price" />
```

The value is a `number`, or `[start, end]` with `range`.

## Inputs
| Name | Description |
|---|---|
| min | Smallest value |
| max | Largest value |
| step | Step of dragging and the arrow keys |
| range | Two handles; the value is `[start, end]` |
| orientation | `horizontal` or `vertical` (height from the `verticalHeight` token) |
| minStepsBetweenHandles | With `range`: how many steps the handles stay apart |
| showSteps | Shows a dot at every step (up to 100) |
| marks | Labelled marks: `{ value, label }[]` |
| animate | Moves smoothly when you click the track |
| valueTemplate | Text read by screen readers, `{value}` is replaced (formatted for the locale), e.g. `{value} %` |
| invalid | Red range; without it the slider follows its form control |
| disabled | Disables the slider (also from the form control) |
| readonly | Shows the value, ignores dragging and keys |
| ariaLabel | Accessible name; with `range` each handle adds "from" / "to" (translated) |
| ariaLabelledBy | Id of the element that names the handles |
| tabindex | Tab order of the handles |
| dt | Design tokens of this instance (`slider`) |
| pt | Classes and styles of the parts: `root`, `track`, `range`, `handle`, `mark`, `label` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | `{ value, originalEvent }` while the value changes |
| slideEnd | `{ value, originalEvent }` when dragging ends or after a key |

## Keyboard
| Key | Action |
|---|---|
| Arrow Right / Up | Adds `step` to the focused handle |
| Arrow Left / Down | Subtracts `step` |
| Page Up / Page Down | Adds / subtracts ten steps |
| Home / End | Lowest / highest value the handle can take (the other handle limits it in a range) |
