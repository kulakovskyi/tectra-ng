# Action tile

A full-width clickable tile: an icon in a tinted square, a title, a line of text and a chevron. Use a stack of tiles for a choice that starts at once — a recovery method, a way to import, a kind of project to create.

```html
<tx-action-tile icon="envelope" title="Email a code" text="We send it to j***@mail.com" (tileClick)="send()" />
```

While `loading` the chevron turns into a spinner and the tile takes no clicks. The title and the text together name the button.

## Inputs
| Name | Description |
|---|---|
| title | Required. Semibold line |
| text | Muted line under the title |
| icon | Icon in the tinted square; left out when empty |
| loading | Spinner instead of the chevron, `aria-busy`, no clicks |
| disabled | Dimmed, no clicks |
| dt | Design tokens of this instance (`actionTile`) |
| pt | Classes and styles of the parts: `root`, `button`, `icon`, `body`, `title`, `text`, `end` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| tileClick | The tile was clicked or pressed (not while `loading` or `disabled`) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves the focus to the tile |
| Enter / Space | Presses the tile |
