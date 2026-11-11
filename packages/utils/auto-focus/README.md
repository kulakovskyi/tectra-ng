# Auto Focus

Moves the focus to a field once it is rendered — the first field of a dialog, a search box that opens, a code input. Put it on the field or on a wrapper (a kit field, a form section): the first focusable element inside gets the focus. It waits for the dialog's own focus handling, and does nothing on the server.

```html
<input txInput txAutoFocus aria-label="Search" />
<tx-input-otp txAutoFocus />
```

## Inputs
| Name | Description |
|---|---|
| txAutoFocus | `false` turns it off, e.g. `[txAutoFocus]="!isMobile()"` |
| select | Also selects the text of an input |

## Methods
| Name | Description |
|---|---|
| focus() | Focuses again (`exportAs: 'txAutoFocus'`) |
