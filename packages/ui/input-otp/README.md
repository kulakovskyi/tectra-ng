# Input OTP

A one-time code in separate cells. Typing moves to the next cell, Backspace and the arrow keys move back, a pasted or SMS-filled code spreads over the cells. The value is one string.

```html
<tx-input-otp formControlName="code" [length]="6" [integerOnly]="true" [groupSize]="3" ariaLabel="Verification code" (completed)="verify($event)" />
```

## Inputs
| Name | Description |
|---|---|
| length | Number of cells |
| integerOnly | Accepts digits only and opens the numeric keyboard on phones |
| mask | Hides the characters like a password |
| groupSize | Shows a separator after every this many cells (`3` → `123–456`) |
| autoFocus | Focuses the first cell on load |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red borders; without it the cells follow the form control |
| disabled | Disables the cells (also from the form control) |
| readonly | Shows the code, no editing |
| name | Base `name` of the cells (`name-0`, `name-1`…) |
| inputId | Id of the first cell, for an outside `<label for>` |
| ariaLabel | Accessible name of the group; each cell is "Character 1 of 6" (translated) |
| ariaLabelledBy | Id of the element that names the group |
| dt | Design tokens of this instance (`inputOtp`); the cells use `formField` |
| pt | Classes and styles of the parts: `root`, `cell`, `separator` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| completed | Every cell is filled — the full code |

## Keyboard
| Key | Action |
|---|---|
| Character | Fills the cell and moves to the next one |
| Backspace | Clears the cell; on an empty cell clears the previous one and moves there |
| Delete | Clears the cell |
| Arrow Left / Right | Moves to the previous / next cell |
| Home / End | Moves to the first / last cell |
| Paste | Spreads the code over the cells from the focused one |
