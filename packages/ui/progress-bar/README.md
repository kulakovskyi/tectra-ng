# Progress bar

Shows how far a task got — a known percentage, or a moving bar while the length is unknown. A `progressbar` for screen readers with its value; the label next to the bar is optional.

```html
<tx-progress-bar [value]="uploaded" [showValue]="true" ariaLabel="Upload" />
<tx-progress-bar mode="indeterminate" ariaLabel="Loading the report" />
```

## Inputs
| Name | Description |
|---|---|
| value | Current value |
| min | Value of an empty bar |
| max | Value of a full bar |
| mode | `determinate` or `indeterminate` (unknown length) |
| showValue | Shows the value next to the bar |
| unit | Unit of the label: `%` shows the percentage, anything else the value with that unit, e.g. ` GB` |
| severity | `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast` |
| color | Own colour of the bar (any CSS colour) |
| size | `small`, `medium` (`normal` is the same), `large` |
| ariaLabel | What is progressing ("Loading" by default, translated) |
| ariaLabelledBy | Id of the element that names the bar |
| dt | Design tokens of this instance (`progressBar`) |
| pt | Classes and styles of the parts: `root`, `track`, `value`, `label` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txProgressBarValue | `<ng-template txProgressBarValue let-value let-percent="percent">` — own label |
