# Cookie notice

A small card in the bottom-left corner that tells the visitor the site keeps only essential cookies, with a "Learn more" link and a "Got it" button. Once dismissed it stays hidden for `maxAgeDays`, remembered in a cookie.

```html
<tx-cookie-notice [link]="['/privacy']" sharedDomain="example.com" />
```

The texts are translated and can be replaced. It renders nothing on the server and appears in the browser after a short delay, so it never moves the page. With `sharedDomain` the choice is kept for every subdomain of that domain.

## Inputs
| Name | Description |
|---|---|
| title | Bold line (translated "Only essential cookies" by default) |
| text | Explanation under the title |
| icon | Icon in the tinted circle (default `shield`) |
| link | Router commands of the "Learn more" link |
| href | Plain URL of the "Learn more" link, when there is no `link` |
| linkLabel | Text of the link (translated "Learn more" by default) |
| acceptLabel | Text of the button (translated "Got it" by default) |
| label | Name of the region (translated "Cookie notice" by default) |
| cookieName | Name of the cookie that keeps the choice (default `cookieNoticeDismissed`) |
| maxAgeDays | How long the choice is kept (default 365) |
| sharedDomain | Parent domain to keep the choice for all its subdomains, e.g. `example.com` |
| dt | Design tokens of this instance (`cookieNotice`) |
| pt | Classes and styles of the parts: `root`, `icon`, `body`, `title`, `text`, `actions`, `link`, `accept` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| dismissed | The visitor pressed the button |

## Methods
| Name | Description |
|---|---|
| show() | Shows the notice again, e.g. from a "Cookie settings" link |
| dismiss() | Hides it and keeps the choice |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the link and the button |
| Enter / Space | On the button: hides the notice |
