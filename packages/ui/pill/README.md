# Pill

A small rounded label for a status, a category or a count — in tables, lists and headers. A tone, three looks, an icon or a dot, and an optional remove button.

```html
<tx-pill tone="success" icon="check" size="small">Active</tx-pill>
<tx-pill tone="warn" variant="outline" [dot]="true">Pending review</tx-pill>
<tx-pill [removable]="true" (removed)="drop(tag)">{{ tag }}</tx-pill>
```

## Inputs
| Name | Description |
|---|---|
| value | Text of the pill; content inside the tag is added after it |
| tone | `neutral`, `primary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`; `secondary` is the same as `neutral`, so tag and badge severities (and `txHttpStatusTone`) fit |
| variant | `soft` (tinted, default), `solid` or `outline` |
| size | `small`, `medium` (`normal` is the same), `large` |
| icon | Icon before the text: tectra name, `pi-` name or icon class. Words after a tectra name are classes of the icon; `spin` (or `pi-spin`) turns it: `icon="spinner spin"` |
| dot | A status dot instead of the icon |
| removable | Adds a remove button |
| removeLabel | Label of the remove button (translated "Remove" when not set or empty) |
| dt | Design tokens of this instance (`pill`) |
| pt | Classes and styles of the parts: `root`, `icon`, `leading`, `label`, `remove` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| removed | The remove button was pressed (click, Enter, Space, Delete or Backspace) |

## Slots
| Name | Description |
|---|---|
| default | The text |
| txPillLeading | An element before the text, e.g. a flag or a tiny avatar: `<img txPillLeading …>`. A component that wraps the pill can pass its own content on with `<ng-container ngProjectAs="[txPillLeading]">` — the slot styles whatever lands in it |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the remove button |
| Enter / Space / Delete / Backspace | Removes the pill from its remove button |
