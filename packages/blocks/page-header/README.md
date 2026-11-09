# Page header

The header of a page: a title, an optional subtitle and the page actions on the right. The actions wrap under the title when the space runs out. Use it at the top of every page instead of a hand-made heading row.

```html
<tx-page-header title="Payments" subtitle="All company payments">
  <button txButton icon="plus" (click)="create()">Create payment</button>
</tx-page-header>
```

The space below the header is set from the outside (a class or a style on `tx-page-header`). A solid `secondary` button among the actions gets the card background and border, so it stays visible on the page background.

## Inputs
| Name | Description |
|---|---|
| title | Required. Text of the page heading |
| subtitle | Muted line under the title — a short description or a count (tabular digits) |
| headingLevel | Level of the heading element, `1` (default) to `6` |
| dt | Design tokens of this instance (`pageHeader`) |
| pt | Classes and styles of the parts: `root`, `heading`, `title`, `subtitle`, `actions` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| default | Page actions: buttons, tabs, pills. The area is left out when empty |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves through the actions in order |
