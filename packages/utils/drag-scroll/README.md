# Drag Scroll

Scroll a wide or tall box by dragging it with the mouse — boards, timelines, wide tables, image strips. Buttons, links, fields and anything marked `data-drag-ignore` stay clickable; a click right after a drag is swallowed so a card does not open by accident. Touch keeps its native scrolling. In pan mode it reports the movement instead, for a canvas you move yourself.

```html
<div class="board" txDragScroll>…columns…</div>
```

## Inputs
| Name | Description |
|---|---|
| panMode | Report `panMove` instead of scrolling the box |
| disabled | Turns dragging off |

## Outputs
| Name | Description |
|---|---|
| panMove | `{ dx, dy }` since the last move, in pan mode |
| dragStart | A drag began (after 4px of movement) |
| dragEnd | The drag ended |

## Methods
| Name | Description |
|---|---|
| isDragging | Signal (`exportAs: 'txDragScroll'`); the host also gets `tx-drag-scroll--dragging` |
