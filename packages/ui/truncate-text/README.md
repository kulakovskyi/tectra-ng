# TruncateText

One line of text cut to a number of characters, with the full value in a tooltip — for long URLs, ids and names in table cells. It can mark search matches, become a link and add a copy button. Screen readers always get the full text.

```html
<tx-truncate-text [text]="link.url" [limit]="30" />
<tx-truncate-text [text]="domain.name" [href]="'https://' + domain.name" [highlight]="search()" copyable />
```

## Inputs
| Name | Description |
|---|---|
| text | The text; a number is shown as text |
| limit | How many characters are shown before the text is cut |
| ellipsis | What follows the cut text (`...` by default) |
| href | Makes the text a link to this address |
| openLink | Makes the text a link to itself — for a `text` that is a URL; `href` wins when both are set |
| target | Where the link opens (`_blank` by default, with `rel="noopener noreferrer"`) |
| highlight | Search terms to mark in the shown text |
| copyable | Adds a button before the text that copies the full text |
| tooltipPlacement | Side of the tooltips (`top` by default) |
| dt | Design tokens of this instance (`truncateText`) |
| pt | Classes and styles of the parts: `root`, `text`, `link`, `copy` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| copied | The text was copied; gives the copied text |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the copy button, then the link or the cut text, which shows the full text in its tooltip |
| Enter | Follows the link |
| Enter / Space | Copies from the copy button |
| Escape | Hides the tooltip |
