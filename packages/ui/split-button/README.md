# Split button

A button with a main action and a menu of related ones — Save with Save as draft, Export with other formats.

```html
<tx-split-button label="Save" icon="check" [model]="saveOptions" (clicked)="save()" />
```

The menu takes the same `TxMenuItem` items as `tx-menu` (sub-menus included) and opens under the menu button, aligned to its end, with an arrow that points at the menu button.

## Inputs
| Name | Description |
|---|---|
| label | Text of the main button (or put it inside the element) |
| icon | Icon of the main button |
| model | Menu items (`TxMenuItem[]`) |
| severity | `primary` (default), `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast` |
| size | `small`, `medium` (default), `large` |
| outlined | Outlined buttons |
| text | Text buttons |
| raised | Raised buttons |
| rounded | Rounded ends |
| disabled | Disables both parts |
| menuDisabled | Disables only the menu button |
| loading | Shows a spinner in the main button |
| menuAriaLabel | Name of the menu button and the menu; "More actions" by default (translated) |
| dt | Design tokens (`splitButton`) — the divider between filled buttons |
| pt | Classes and styles of the parts: `root`, `button`, `menuButton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| clicked | The main button was clicked |
| itemSelected | A menu item was chosen (`{ item, originalEvent }`) |
| menuOpened | The menu opened |
| menuClosed | The menu closed |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the main button: runs it; on the menu button: opens the menu |
| Arrow Down / Arrow Up | On the menu button: opens the menu at the first / last item |
| Escape | Closes the menu, focus goes back to the menu button |
