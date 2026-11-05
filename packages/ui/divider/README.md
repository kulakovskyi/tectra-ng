# Divider

A line between groups of content — horizontal or vertical, solid, dashed or dotted, with an optional label in it.

```html
<tx-divider>or continue with</tx-divider>
<tx-divider layout="vertical" />
```

## Inputs
| Name | Description |
|---|---|
| layout | `horizontal` or `vertical` |
| type | `solid`, `dashed` or `dotted` |
| align | Position of the content: `start`, `center`, `end` |
| dt | Design tokens of this instance (`divider`) |
| pt | Classes and styles of the parts: `root`, `content` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| default | Text or an icon inside the line |
