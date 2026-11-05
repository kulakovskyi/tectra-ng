# Speed dial

A floating round button that fans out a few quick actions — in a line, a circle, a half or a quarter of one.

```html
<tx-speed-dial ariaLabel="Create" direction="up" [model]="createActions" (itemSelected)="create($event.item)" />
```

Items are `TxMenuItem`s (`label`, `icon`, `command`, `disabled`, `visible`, `severity: 'danger'`); each one is an icon button named by its label, with the label in a tooltip.

## Inputs
| Name | Description |
|---|---|
| model | Items (`TxMenuItem[]`) |
| visible | Two-way open state (`[(visible)]`) |
| direction | `up` (default), `down`, `left`, `right`, `up-left`, `up-right`, `down-left`, `down-right` |
| type | `linear` (default), `circle`, `semi-circle`, `quarter-circle` |
| radius | Radius in px for the circle types (default 80) |
| mask | Dims the page while open |
| hideOnClickOutside | Closes on a press outside (default on) |
| showIcon | Icon of the closed button (default `plus`, turns into a cross when open) |
| hideIcon | Own icon of the open button |
| severity | Severity of the main button |
| itemSeverity | Severity of the items (default `secondary`) |
| size | Main button: `small`, `medium` (default), `large` |
| itemSize | Action buttons: `small` (default), `medium`, `large` |
| disabled | Disables the button |
| ariaLabel | Name of the button and the menu |
| dt | Design tokens (`speedDial`) — spacing, timing, mask |
| pt | Classes and styles of the parts: `root`, `button`, `list`, `item`, `mask` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemSelected | An item was chosen (`{ item, originalEvent }`) |
| opened | The items opened |
| closed | The items closed |
| visibleChange | `visible` changed |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Opens the items and moves to the first one, or closes them |
| Arrow keys | On the button: opens at the first item; in the items: along the direction (circles: Right / Down next, Left / Up previous) |
| Home / End | First / last item |
| Escape | Closes, focus goes back to the button |
| Tab | Closes and moves on |
