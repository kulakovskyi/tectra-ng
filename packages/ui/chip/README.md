# Chip

A compact item a person picked or entered — a recipient, a filter, a person with a photo. A label, an icon or an image, and a remove button.

```html
<tx-chip label="Olena Kovalenko" image="/avatars/olena.jpg" alt="" [removable]="true" (removed)="drop(person)" />
```

## Inputs
| Name | Description |
|---|---|
| label | Text of the chip; content inside the tag is added after it |
| icon | Icon before the text: tectra name, `pi-` name or icon class |
| image | Round image before the text, e.g. an avatar |
| alt | Alternative text of the image (empty when the label already says it) |
| removable | Adds a remove button |
| removeIcon | Icon of the remove button |
| removeLabel | Label of the remove button (translated "Remove" by default) |
| dt | Design tokens of this instance (`chip`) |
| pt | Classes and styles of the parts: `root`, `image`, `icon`, `label`, `remove` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| removed | The remove button was pressed |

## Slots
| Name | Description |
|---|---|
| default | The text |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the remove button |
| Enter / Space / Delete / Backspace | Removes the chip from its remove button |
