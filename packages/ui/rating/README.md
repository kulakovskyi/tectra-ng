# Rating

A score out of a few stars. Hover to preview, click to rate; half stars with `allowHalf`. One focusable `slider` for screen readers and the keyboard ("3 of 5").

```html
<tx-rating formControlName="score" [allowHalf]="true" [clearable]="true" ariaLabel="Your rating" />
```

## Inputs
| Name | Description |
|---|---|
| stars | Number of stars |
| allowHalf | Half steps: the left half of a star rates x.5, the arrow keys move by 0.5 |
| onIcon | Icon of a filled star |
| offIcon | Icon of an empty star |
| clearable | Shows a clear button while there is a rating |
| clearLabel | Text next to the clear icon; without it the button has a translated `aria-label` |
| size | `small`, `medium`, `large` |
| invalid | Red stars; without it the rating follows its form control |
| disabled | Disables the rating (also from the form control) |
| readonly | Shows the rating, ignores clicks and keys |
| ariaLabel | Accessible name of the rating |
| ariaLabelledBy | Id of the element that names the rating |
| tabindex | Tab order of the stars |
| dt | Design tokens of this instance (`rating`) |
| pt | Classes and styles of the parts: `root`, `stars`, `star`, `clear` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| rated | `{ value, originalEvent }` after a click, a key or clearing |
| cleared | The clear button or a key removed the rating |

## Slots
| Name | Description |
|---|---|
| txRatingOnIcon | `<ng-template txRatingOnIcon let-index>` — own filled star |
| txRatingOffIcon | `<ng-template txRatingOffIcon let-index>` — own empty star |

## Keyboard
| Key | Action |
|---|---|
| Arrow Right / Up | One star (or half) more |
| Arrow Left / Down | One star (or half) less; below the first star clears |
| Home / End | Lowest / highest rating |
| 1 – 9 | Sets that many stars |
| Delete / Backspace / 0 | Clears the rating |
