# IconField

Icons, text, a clear button or a copy button inside a field. Items before the input go on the left, `position="end"` puts them on the right; the input padding grows to make room by itself.

```html
<tx-icon-field>
  <tx-input-icon [icon]="'search'" />
  <input txInput placeholder="Search" />
  <tx-input-clear />
</tx-icon-field>
```

## Inputs
| Name | Description |
|---|---|
| fluid | Takes the full width of its container; inherits `<tx-fluid>` |
| icon | `tx-input-icon`: a `@tectra/icons` name, a registered icon or any icon class; or put text / markup inside (prefix, suffix, unit) |
| position | `tx-input-icon`: `start` (default) or `end` — a static attribute, `position="end"` |

## Outputs
| Name | Description |
|---|---|
| cleared | `tx-input-clear`: the field was cleared |
| copied | `tx-input-copy`: the value that was copied |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the clear / copy buttons after the field |
| Enter / Space | On the clear / copy button: clears / copies |
