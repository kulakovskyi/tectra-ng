# Textarea

A multi-line field on the native `<textarea>`: the same look, sizes, variants and states as `txInput`, plus growing with the text, a resize handle you control, a borderless look and a character counter.

```html
<textarea txTextarea rows="3" autoResize [maxRows]="8" formControlName="bio" maxlength="280" #bio="txTextarea"></textarea>
<tx-textarea-counter [for]="bio" />
```

## Inputs
| Name | Description |
|---|---|
| autoResize | Grows with the text instead of scrolling; turns the resize handle off |
| maxHeight | With `autoResize`: stops growing at this height in px, then scrolls |
| maxRows | With `autoResize`: stops growing after this many rows, then scrolls |
| resize | Resize handle: `none`, `vertical` (default), `horizontal`, `both` |
| borderless | No border and no background — for notes, comments and inline editing |
| size | `small`, `medium`, `large` |
| variant | `outlined` or `filled` |
| invalid | Red border and `aria-invalid`; without it the field follows its form control |
| fluid | Takes the full width of its container; inherits `<tx-fluid>` |
| dt | `textarea` design tokens of this instance (min height, borderless, counter) |
| fieldDt | `formField` design tokens of this instance (border, background, padding…) |
| pt | Classes and styles of the `root` part |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
| for | `tx-textarea-counter`: the textarea to count (`#ref="txTextarea"`); shows `length / maxlength`, or the length without `maxlength` |

## Outputs
| Name | Description |
|---|---|
| heightChange | With `autoResize`: the new height in px after the field grew or shrank |

## Keyboard
| Key | Action |
|---|---|
| Native textarea keys | Typing, selection, Tab leaves the field |
