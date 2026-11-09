# Hover effect

A 3D tilt that follows the mouse: wrap a card, a plan or a picture and it leans towards the pointer, then settles back smoothly when the pointer leaves.

```html
<tx-hover-effect>
  <tx-card title="Pro" subtitle="For growing teams" />
</tx-hover-effect>
```

Only a mouse tilts it — touch and pens leave it still, and so does reduced motion. The tilt is the distance from the middle divided by `constrain`, in degrees: a smaller `constrain` tilts more.

## Inputs
| Name | Description |
|---|---|
| constrain | How much the pointer distance is divided by — larger is calmer (default 100) |
| disabled | Turns the tilt off |
| dt | Design tokens of this instance (`hoverEffect`) |
| pt | Classes and styles of the parts: `root`, `layer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the smooth return (the tilt stays) |

## Slots
| Name | Description |
|---|---|
| default | What tilts |

## Methods
| Name | Description |
|---|---|
| reset() | Puts the content straight again |
