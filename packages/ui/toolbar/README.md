# Toolbar

A bar that groups actions and controls: content at the start, in the centre and at the end. Wraps onto more lines when the space runs out.

```html
<tx-toolbar ariaLabel="Document">
  <button txButton txToolbarStart icon="plus">New</button>
  <tx-icon-field txToolbarCenter>…</tx-icon-field>
  <button txButton txToolbarEnd icon="save">Save</button>
</tx-toolbar>
```

## Inputs
| Name | Description |
|---|---|
| ariaLabel | Accessible name of the toolbar |
| ariaLabelledBy | Id of the element that names the toolbar |
| orientation | `horizontal` or `vertical`: the direction of the groups and `aria-orientation` |
| dt | Design tokens of this instance (`toolbar`) |
| pt | Classes and styles of the parts: `root`, `start`, `center`, `end` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txToolbarStart | Content of the start group |
| txToolbarCenter | Content of the centre group |
| txToolbarEnd | Content of the end group |
| default | Free content before the groups |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves through the controls of the toolbar in order |
