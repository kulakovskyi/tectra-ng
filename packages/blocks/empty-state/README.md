# Empty state

The "nothing here yet" block: an icon in a tinted circle, an optional title, a muted line of text and the actions that get the user going. Use it for an empty list, a search without results or a section the user has not set up.

```html
<tx-empty-state icon="bolt" title="No workers yet" text="Create the first worker to start.">
  <button txButton icon="plus" (click)="create()">Create worker</button>
</tx-empty-state>
```

It is a `status` region, so screen readers read the title and the text when it appears.

## Inputs
| Name | Description |
|---|---|
| icon | Icon in the circle (default `inbox`) |
| title | Semibold line; left out when empty |
| text | Muted line under the title; left out when empty |
| variant | `plain` — no frame (default); `framed` — own card frame for a page-level empty state; `inset` — a ground-coloured block inside a card |
| size | `compact` — one row with a small icon; `normal` (default); `large` — onboarding size |
| tone | Colour of the icon: `primary` (default), `neutral`, `success`, `info`, `warn`, `danger` |
| dt | Design tokens of this instance (`emptyState`) |
| pt | Classes and styles of the parts: `root`, `icon`, `body`, `title`, `text` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| default | Actions under the text, usually one or two buttons |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves through the actions |
