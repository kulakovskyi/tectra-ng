# Tag list

A row of tags that stays on one line: it shows the first `limit` tags and a `+N` tag that opens the rest in a popover. Each tag may have its own severity, icon and tooltip. An empty list shows a dash.

```html
<tx-tag-list [tags]="article.tags" [limit]="3" />
```

## Inputs
| Name | Description |
|---|---|
| tags | Items `{ value, severity?, icon?, tooltip? }` |
| limit | How many tags to show before `+N`; all of them when not set |
| severity | Severity of tags that have none, and of the `+N` tag (`secondary` by default) |
| size | Size of the tags |
| rounded | Pill-shaped tags |
| emptyText | Text when there are no tags (`-` by default) |
| moreLabel | Accessible name of the `+N` button; "{count} more" by default |
| ariaLabel | Accessible name of the list |
| dt | Design tokens (`tag`, the `list` group) |
| pt | Classes and styles of the parts: `root`, `tag`, `more`, `popover` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Drops the tectra styles, keeps the behaviour |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the `+N` button |
| Enter / Space | Opens the hidden tags |
| Escape | Closes them, focus back on `+N` |
