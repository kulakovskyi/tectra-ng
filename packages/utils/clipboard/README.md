# Clipboard

Copies a value on click and says so with a kit toast — "Copied to clipboard" in the tectra locale, your own text, or nothing. Works outside a secure context too (falls back to a hidden selection), and turns a plain element into a keyboard-reachable button. Needs a `<tx-toast />` outlet in the app shell for the message.

```html
<button txButton icon="copy" aria-label="Copy link" [txCopy]="inviteUrl"></button>
<code [txCopy]="order.id">{{ order.id }}</code>
```

## Inputs
| Name | Description |
|---|---|
| txCopy | The value to copy; nothing happens when it is empty |
| copyMessage | Toast text after copying; translated "Copied to clipboard" by default, `false` for no toast |
| copyErrorMessage | Toast text when the browser refuses; translated "Could not copy" by default, `false` for none |

## Outputs
| Name | Description |
|---|---|
| copied | The copied text |
| copyFailed | The text that could not be copied |

## Methods
| Name | Description |
|---|---|
| copy() | Copies now (`exportAs: 'txCopy'`); resolves to `true` when it worked |
| TxClipboard.copy(value, { message?, errorMessage? }) | The same from code, with the same toasts |

## Functions
| Name | Description |
|---|---|
| copyToClipboard(text, document?) | Copies without a toast; resolves to `true` or `false` (always `false` on the server) |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Copies, when the host is not a button or a link already |
