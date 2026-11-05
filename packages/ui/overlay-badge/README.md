# Overlay badge

Puts a badge on the corner of anything — an icon, a button, an avatar. A number, a short text, or a dot without a value; big numbers turn into `99+`, zero hides itself.

```html
<tx-overlay-badge [value]="unread" [max]="99">
  <button txButton icon="bell" [text]="true" aria-label="Notifications"></button>
</tx-overlay-badge>
```

## Inputs
| Name | Description |
|---|---|
| value | Number or short text; no value — a dot |
| severity | Colour of the badge: `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast` |
| size | `small`, `medium`, `large`, `xlarge` |
| max | Shows `max+` above this number |
| showZero | Keeps the badge when the value is 0 |
| hidden | Hides the badge |
| shape | `rect` (corner of a box) or `circle` (edge of a round avatar) |
| ariaLabel | What the badge means for screen readers, e.g. "4 unread"; the badge is added to the `aria-describedby` of the focusable content |
| dt | Design tokens of this instance (`overlayBadge`); the badge itself uses `badge` |
| pt | Classes and styles of the parts: `root`, `badge` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| default | The content the badge sits on |
