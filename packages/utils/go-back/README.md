# Go Back

A back button that never leaves the app: it goes back in history when the user came from another page of the app, and opens a fallback route when the page was opened directly (a link from an email, a new tab, a reload after a deep link).

```html
<button txButton icon="arrow-left" label="Back" txGoBack="/orders"></button>
```

## Inputs
| Name | Description |
|---|---|
| txGoBack | Fallback route — a URL, router commands or a `UrlTree`; `/` by default |

## Outputs
| Name | Description |
|---|---|
| navigated | `back` or `fallback` — which way it went |

## Methods
| Name | Description |
|---|---|
| back() | Goes back now (`exportAs: 'txGoBack'`) |
| canGoBack() | `true` when an earlier page of the app is in the history |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Goes back, when the host is not a button or a link already |
