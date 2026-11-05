# Link

`<tx-link>` shows a URL, an email or a phone number as a link: it builds the `href`, shortens long text, marks search matches and can add a copy button. Web links open in a new tab with `rel="noopener noreferrer"`, an arrow icon and a hidden "opens in a new tab" for screen readers. `<tx-icon-link>` is an icon with text for menus and footers — a router link with the active state, an external link, or a button.

```html
<tx-link link="docs.example.com" [copyable]="true" />
<tx-link link="ann@example.com" type="email" />
<tx-icon-link icon="user" text="Profile" routerLink="/profile" />
```

## Inputs
| Name | Description |
|---|---|
| link | `tx-link`: URL (without a protocol `https://` is added), email or phone number |
| type | `tx-link`: `url`, `email` (`mailto:`) or `phone` (`tel:`) |
| linkText | `tx-link`: own text instead of the link |
| highlight | `tx-link`: search terms to mark in the text |
| maxLength | `tx-link`: shortens longer text with `…`; the full text is in the tooltip |
| routerLink | Router commands; the link stays in the app |
| target | Own target; web links use `_blank` by default |
| external | `tx-link`: shows or hides the arrow icon; shown when the link opens a new tab by default |
| copyable | `tx-link`: adds a button that copies the link |
| icon | `tx-icon-link`: icon name or icon class |
| text | `tx-icon-link`: the text |
| href | `tx-icon-link`: external address, opens in a new tab |
| exact | `tx-icon-link`: the router link is active only on its exact URL |
| dt | Design tokens of this instance (`link`, `iconLink`) |
| pt | Classes and styles of the parts: `root`, `anchor`, `text`, `external`, `copy` (link); `root`, `anchor`, `icon`, `text` (icon link) |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| copied | `tx-link`: the link was copied; gives the copied text |

## Slots
| Name | Description |
|---|---|
| default | `tx-icon-link`: content after the text, e.g. a badge |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the link, then the copy button |
| Enter | Follows the link |
| Enter / Space | Copies from the copy button |
