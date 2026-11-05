# Status icon

A small coloured icon for a yes / no or a severity state in tables and lists — a check in green or a cross in red, with a label for screen readers and a native tooltip.

```html
<tx-status-icon [status]="user.verified" label="Verified" />
<tx-status-icon severity="warn" label="Expires soon" />
```

## Inputs
| Name | Description |
|---|---|
| status | On (green check) or off (red cross) |
| severity | Instead of `status`: `success`, `info`, `warn`, `danger`, `secondary` |
| icon | Own icon name or icon class |
| label | Accessible name and tooltip; "Yes" / "No" for `status` by default; empty makes the icon decorative |
| toolTip | Same as `label` |
| size | `small`, `medium`, `large` |
| dt | Design tokens of this instance (`statusIcon`) |
| pt | Classes and styles of the parts: `root`, `icon` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
