# Panel menu

A vertical menu of collapsible sections for app navigation. Two looks: `panel` (each root item is a bordered panel with a toggle header) and `sidebar` (root items are section titles above their links — the app sidebar). Nested items open in place with an animation; the item of the current route is highlighted and its parents open. A clicked link is highlighted as soon as its navigation starts and goes back when the navigation is cancelled or fails; when the current page has a `canDeactivate` guard (a leave confirm) the highlight waits until the guards let the page go.

```html
<tx-panel-menu [model]="items" />
<tx-panel-menu variant="sidebar" ariaLabel="Main" [model]="navigation" [(expandedKeys)]="open" />
```

Items are `TxPanelMenuItem` — the kit menu item (`label`, `icon`, `routerLink`, `queryParams`, `fragment`, `url`, `target`, `command`, `disabled`, `visible`, `separator`, `badge`, `title`, `items`, `id`) plus `expanded` (open at the start), `active` (marks the current item yourself — for items that run a `command`; without it the current item comes from the route), `routerLinkActiveOptions` (`{ exact: true }` or router match options; a subset match by default) and `routerLinkActiveExclude` (router links whose pages do not make the item active — `['/projects/owners']` on a `/projects` item next to an own "Owners" item). `badge` also takes a signal, so a counter updates in place. Only links are highlighted: an item with nested items does not navigate, so on the page of its own `routerLink` it just opens; in `sidebar` a section with an empty `label` gets no title.

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
| translate | Translate function: item labels, section titles and item titles are keys passed through it; a function that reads signals updates the menu when they change |
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
| txPanelMenuItem | `<ng-template txPanelMenuItem let-item let-level="level" let-active="active" let-expanded="expanded" let-hasSubmenu="hasSubmenu" let-label="label">` — content of every header and item; `label` is the translated label |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves between the panel headers and into each menu |
| Down / Up arrow | Next / previous header, or next / previous visible item; disabled items are skipped |
| Home / End | First / last header or item |
| Right arrow | Opens a closed item, or moves into an open one |
| Left arrow | Closes an open item, or moves to its parent |
| Enter / Space | Opens or closes an item with children, follows a link or runs the command |
