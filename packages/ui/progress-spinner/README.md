# Progress spinner

A spinning circle while something loads and its length is unknown. A busy `progressbar` named "Loading" (translated) unless you name it. With reduced motion it turns slowly instead of stopping, so it still reads as loading.

```html
<tx-progress-spinner size="small" />
<tx-progress-spinner [size]="64" [strokeWidth]="3" ariaLabel="Loading the dashboard" />
```

## Inputs
| Name | Description |
|---|---|
| size | `small`, `medium`, `large` or a number of px |
| strokeWidth | Thickness of the ring in units of a 50 × 50 box |
| fill | Fill inside the ring |
| animationDuration | One turn, e.g. `1.5s` |
| color | Own colour of the moving arc |
| ariaLabel | What is loading |
| dt | Design tokens of this instance (`progressSpinner`) |
| pt | Classes and styles of the parts: `root`, `svg`, `track`, `circle` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
