# Panel

A titled section of a page: an icon, a title and a subtitle, actions in the header, the content and an optional footer. It can collapse. Three looks: `card` (a bordered box), `inset` (a tinted block inside a card) and `plain` (no box).

```html
<tx-panel title="Members" subtitle="People who can open this project" icon="users">
  <button txPanelActions txButton size="small">Invite</button>
  …
</tx-panel>
```

## Inputs
| Name | Description |
|---|---|
| title | Title of the panel; also names the panel region |
| subtitle | Muted line under the title |
| icon | Icon in a tinted square before the title |
| variant | `card`, `inset` or `plain` |
| align | Vertical alignment of the title and the actions: `start`, `center`, `end` |
| headingLevel | Heading level of the title, 2 by default |
| toggleable | Adds a button that collapses the content |
| collapsed | Two-way: the content is collapsed |
| toggleLabel | Label of the collapse button (the title by default) |
| dt | Design tokens of this instance (`panel`) |
| pt | Classes and styles of the parts: `root`, `header`, `icon`, `title`, `subtitle`, `actions`, `toggle`, `body`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| collapsedChange | The content was collapsed or expanded |

## Slots
| Name | Description |
|---|---|
| default | The content |
| txPanelActions | Buttons or links on the right of the header |
| txPanelHeader | Extra content under the title, e.g. pills |
| txPanelFooter | Actions at the bottom |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Collapses or expands from the toggle button |
