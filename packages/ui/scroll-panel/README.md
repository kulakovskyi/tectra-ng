# Scroll panel

A scroll area with slim, themed scroll bars in place of the native ones. The bars appear while the pointer is over the panel, follow the content as it scrolls or resizes and can be dragged. Give the panel a `height` or a `max-height`.

```html
<tx-scroll-panel ariaLabel="Release notes" style="height: 240px">
  <article>…</article>
</tx-scroll-panel>
```

## Inputs
| Name | Description |
|---|---|
| step | Pixels an arrow key scrolls while a bar has focus |
| ariaLabel | Accessible name; makes the content a named `region` |
| dt | Design tokens of this instance (`scrollPanel`) |
| pt | Classes and styles of the parts: `root`, `content`, `barX`, `barY` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

`scrollTop(value)` and `scrollLeft(value)` scroll to a position; `refresh()` measures the bars again (they update by themselves on scroll and size changes).

## Slots
| Name | Description |
|---|---|
| default | The content to scroll |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus to the content (it is focusable, so the native keys scroll it) |
| Arrows / Page Up / Page Down / Home / End | Scroll the focused content |
| Arrows | On a clicked bar: scroll by `step` pixels along its axis |
| Page Up / Page Down | On a clicked bar: scroll by one view |
| Home / End | On a clicked bar: scroll to the start / end |
