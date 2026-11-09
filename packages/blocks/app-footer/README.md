# App footer

The footer of an app: `© <year> <name>` and a row of legal links. One footer for public pages, the signed-in layout and consoles.

```html
<tx-app-footer
  name="Acme"
  [links]="[{ label: 'Privacy policy', routerLink: '/privacy' }, { label: 'Terms', routerLink: '/terms' }]"
/>
```

When the footer is narrower than 768px the links go above the copyright line (it follows its own width).

## Inputs
| Name | Description |
|---|---|
| name | Required. Name after the year |
| links | Legal links (`TxAppFooterLink[]`: `label`, `routerLink` + `queryParams`, or `url` + `target`); empty — no navigation |
| variant | `page` — full width public pages with a centred column (default); `app` — inside the signed-in layout; `console` — inside a console layout |
| navLabel | Name of the links navigation; the translated "Legal" by default |
| year | Year to show; the current year by default |
| dt | Design tokens of this instance (`appFooter`) |
| pt | Classes and styles of the parts: `root`, `inner`, `copy`, `nav`, `link` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves through the links |
