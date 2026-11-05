# Menu

A list of actions or links. `<tx-menu>` shows them in place or as a popup from a button, `<tx-tiered-menu>` opens nested items in sub-menus, `<tx-context-menu>` opens on right-click.

```html
<button txButton icon="ellipsis-h" [text]="true" aria-label="Row actions" [txMenuTrigger]="rowMenu"></button>
<tx-menu #rowMenu popup ariaLabel="Row actions" [model]="actions" (itemSelected)="run($event.item)" />
```

```ts
actions: TxMenuItem[] = [
  { id: 'edit', label: 'Edit', icon: 'pencil', shortcut: 'E' },
  { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
  { separator: true },
  { id: 'delete', label: 'Delete', icon: 'trash', severity: 'danger' },
];
```

`TxMenuItem`: `id`, `label`, `icon`, `iconSeverity` (in `tx-context-menu` the icon sits in a small filled button of this severity, `primary` by default — the look of a row action), `command({ item, originalEvent })`, `routerLink` (+ `queryParams`, `fragment`), `url` + `target`, `disabled`, `visible`, `separator`, `severity: 'danger'`, `badge`, `shortcut` (shown only — bind the keys yourself), `title`, `items` (a group in `tx-menu`, a sub-menu in `tx-tiered-menu` and `tx-context-menu`), `data`.

A popup menu opens from `[txMenuTrigger]` (click, Arrow Down / Up), or from code: `menu.toggle($event)`, `menu.show(element, 'first' | 'last')`, `menu.hide()`. All three are in `@tectra/ui/menu`.

## Inputs
| Name | Description |
|---|---|
| model | Items (`TxMenuItem[]`) |
| popup | Opens as a popup from a trigger instead of showing in place |
| tiered | Nested items open as sub-menus (on by default for `tx-tiered-menu`) |
| placement | Popup placement, `bottom-start` by default; flips when there is no room |
| offset | Gap between the popup and its trigger in px |
| variant | `default`, or `context` for the look of a context menu (set by `tx-context-menu`) |
| ariaLabel | Name of the menu |
| ariaLabelledBy | Id of the element that names the menu |
| target | `tx-context-menu`: element that opens the menu on right-click, the context menu key or Shift + F10 |
| global | `tx-context-menu`: opens on right-click anywhere on the page |
| txMenuTrigger | On a button: the popup menu it opens |
| dt | Design tokens of this menu (`menu`) |
| pt | Classes and styles of the parts: `root`, `item`, `icon`, `label`, `shortcut`, `badge`, `separator`, `groupLabel`, `submenuIcon` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemSelected | An item without sub-items was chosen (`{ item, originalEvent }`); a popup closes after it |
| opened | The popup opened |
| closed | The popup closed |

## Slots
| Name | Description |
|---|---|
| txMenuItem | `<ng-template txMenuItem let-item let-hasSubmenu="hasSubmenu">` — own content of every item |

## Keyboard
| Key | Action |
|---|---|
| Arrow Down / Arrow Up | Next / previous item, wrapping around; on a trigger — opens the menu at the first / last item |
| Home / End | First / last item |
| A–Z | Moves to the next item that starts with the typed letters |
| Enter / Space | Runs the item or opens its sub-menu |
| Arrow Right | Opens the sub-menu and moves into it |
| Arrow Left | Closes the sub-menu and goes back to its item |
| Escape | Closes the sub-menu, or the popup with focus back on the trigger |
| Tab | Closes the popup and moves on |
| Shift + F10 / Context menu key | `tx-context-menu`: opens the menu at the focused element |
