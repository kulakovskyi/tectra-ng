# Knob

A value on a dial: drag along the ring or use the keyboard. `arc="dial"` leaves a gap at the bottom (270°), `arc="ring"` is a full circle with a handle. `limit` caps the value below `max` and shows the unreachable part of the ring.

```html
<tx-knob formControlName="volume" [step]="5" valueTemplate="{value}%" ariaLabel="Volume" />
<tx-knob formControlName="quota" arc="ring" [max]="100" [limit]="80" ariaLabel="Storage quota" />
```

## Inputs
| Name | Description |
|---|---|
| min | Smallest value |
| max | Largest value of the scale |
| step | Step of dragging and the arrow keys |
| limit | Largest value you can set, below `max`; the rest of the ring is marked |
| size | Width and height in px |
| strokeWidth | Thickness of the ring, in units of a 100 × 100 box |
| arc | `dial` (270°, gap at the bottom) or `ring` (full circle from the top) |
| showValue | Shows the value in the middle |
| showHandle | Shows a handle at the end of the value; on by default for `ring` |
| valueTemplate | Text of the value, `{value}` is replaced (formatted for the locale), e.g. `{value}%` |
| invalid | Red ring; without it the knob follows its form control |
| disabled | Disables the knob (also from the form control) |
| readonly | Shows the value, ignores dragging and keys |
| ariaLabel | Accessible name of the knob |
| ariaLabelledBy | Id of the element that names the knob |
| tabindex | Tab order |
| dt | Design tokens of this instance (`knob`): value, range, limit, text and handle colours |
| pt | Classes and styles of the parts: `root`, `svg`, `range`, `value`, `handle`, `text` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| changed | `{ value, originalEvent }` while dragging or after a key |

## Slots
| Name | Description |
|---|---|
| txKnobValue | `<ng-template txKnobValue let-value>` — own content in the middle |

## Keyboard
| Key | Action |
|---|---|
| Arrow Right / Up | Adds `step` |
| Arrow Left / Down | Subtracts `step` |
| Page Up / Page Down | Adds / subtracts ten steps |
| Home / End | `min` / the limit (or `max`) |
