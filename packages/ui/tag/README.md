# Tag

A short label with a severity — a version, a category, an ID you can copy. Square corners by default, `rounded` for a pill shape; it can copy its text or be removed.

```html
<tx-tag severity="success" icon="check">Released</tx-tag>
<tx-tag severity="secondary" [copyable]="true">ord_8F2KQ1</tx-tag>
```

## Inputs
| Name | Description |
|---|---|
| value | Text of the tag; content inside the tag is added after it |
| severity | `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast` |
| size | `small`, `medium` (`normal` is the same), `large` |
| rounded | Fully rounded corners |
| icon | Icon before the text: tectra name, `pi-` name or icon class |
| copyable | Adds a button that copies the text; it shows a check for a moment |
| removable | Adds a remove button |
| removeLabel | Label of the remove button (translated "Remove" by default) |
| dt | Design tokens of this instance (`tag`) |
| pt | Classes and styles of the parts: `root`, `icon`, `label`, `copy`, `remove` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| copied | The text was copied |
| removed | The remove button was pressed |

## Slots
| Name | Description |
|---|---|
| default | The text |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the copy and remove buttons |
| Enter / Space | Copies or removes from the focused button |
| Delete / Backspace | Removes from the remove button |
