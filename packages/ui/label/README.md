# Label

Names a field. Three forms: `<tx-label>` above the field, `<tx-float-label>` inside the field that moves up on focus or value, `<tx-ifta-label>` inside the field above the value. Inside the float and ifta labels use a native `<label for>` after the field; they work with `txInput`, `textarea` and `tx-select` (give the select an `inputId`).

```html
<tx-label for="email" required>Email</tx-label>
<input txInput id="email" />

<tx-float-label variant="on">
  <input txInput id="name" />
  <label for="name">Name</label>
</tx-float-label>
```

## Inputs
| Name | Description |
|---|---|
| for | `tx-label`: id of the field it names |
| required | `tx-label`: shows a required mark (also put `required` on the field) |
| colon | `tx-label`: adds `:` after the text |
| subtle | `tx-label`: smaller, muted — for filters and dense forms |
| tooltip | `tx-label`: help icon after the text with this hint |
| variant | `tx-float-label`: `over` (moves above the field), `in` (moves to the top inside), `on` (sits on the border) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the help icon of a `tx-label` |
| Click on the label | Focuses the field |
