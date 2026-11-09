# Panel menu

A vertical menu of collapsible sections for app navigation. Two looks: `panel` (each root item is a bordered panel with a toggle header) and `sidebar` (root items are section titles above their links — the app sidebar). Nested items open in place with an animation; the item of the current route is highlighted and its parents open.

```html
<tx-panel-menu [model]="items" />
<tx-panel-menu variant="sidebar" ariaLabel="Main" [model]="navigation" [(expandedKeys)]="open" />
```

Items are `TxPanelMenuItem` — the kit menu item (`label`, `icon`, `routerLink`, `queryParams`, `fragment`, `url`, `target`, `command`, `disabled`, `visible`, `separator`, `badge`, `title`, `items`, `id`) plus `expanded` (open at the start), `active` (marks the current item yourself — for items that run a `command`; without it the current item comes from the route) and `routerLinkActiveOptions` (`{ exact: true }` or router match options; a subset match by default).

## Inputs
| Name | Description |
|---|---|
| model | The items, `TxPanelMenuItem[]` |
| collapsed | `sidebar`: shows only the icons in one column (nested items lose their indent) — the labels and section titles fade out (their space stays), badges and locks sit on the icons; for a narrow rail that opens on hover |
| variant | `panel` or `sidebar` |
| multiple | Several branches can be open at once; off, opening one closes its siblings (root panels in `panel`, every level in `sidebar`) |
| expandedKeys | Two-way: the open items, `{ [key]: boolean }`; a key is the item `id` or its index path (`0-1-2`) |
| badgeMax | `sidebar`: numbers above it show as `99+` (zero and less are hidden) |
| ariaLabel | Makes the menu a `navigation` landmark with this name |
| dt | Design tokens of this instance (`panelMenu`) |
| pt | Classes and styles of the parts: `root`, `panel`, `header`, `section`, `tree`, `item`, `icon`, `label`, `badge`, `lock`, `submenuIcon`, `separator` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| expandedKeysChange | An item was opened or closed, or the route opened its parents |
| itemClick | An item was clicked: `{ item, originalEvent }` (after its `command`) |

## Slots
| Name | Description |
|---|---|
| txPanelMenuItem | `<ng-template txPanelMenuItem let-item let-level="level" let-active="active" let-expanded="expanded" let-hasSubmenu="hasSubmenu">` — content of every header and item |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves between the panel headers and into each menu |
| Down / Up arrow | Next / previous header, or next / previous visible item; disabled items are skipped |
| Home / End | First / last header or item |
| Right arrow | Opens a closed item, or moves into an open one |
| Left arrow | Closes an open item, or moves to its parent |
| Enter / Space | Opens or closes an item with children, follows a link or runs the command |
