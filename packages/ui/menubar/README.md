# Menubar

A horizontal menu bar for the top of an app or a page. Root items open their submenus below (on the kit menu panel), deeper levels open to the side. Below the breakpoint the bar turns into a button with an inline menu where nested items open in place.

```html
<tx-menubar ariaLabel="Editor" [model]="items">
  <img txMenubarStart src="logo.svg" alt="" />
  <tx-avatar txMenubarEnd label="OK" />
</tx-menubar>
```

Items are the kit `TxMenuItem` from `@tectra-ng/ui/menu`: `label`, `icon`, `command`, `routerLink` (+ `queryParams`, `fragment`), `url` + `target`, `disabled`, `visible`, `separator`, `badge`, `title`, `items`, `data`.

## Inputs
| Name | Description |
|---|---|
| model | The items, `TxMenuItem[]` |
| autoDisplay | Opens a root submenu when the pointer is over its item, without the first click |
| breakpoint | Width below which the bar turns into a button with an inline menu (`960px`) |
| ariaLabel | Accessible name of the menu bar |
| ariaLabelledBy | Id of the element that names the menu bar |
| dt | Design tokens of this instance (`menubar`); submenus use the `menu` tokens |
| pt | Classes and styles of the parts: `root`, `start`, `end`, `list`, `item`, `icon`, `label`, `badge`, `submenuIcon`, `separator`, `submenu`, `mobileButton` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemClick | An item without a submenu was picked: `{ item, originalEvent }` |
| focused | Focus came into the bar |
| blurred | Focus left the bar |

## Slots
| Name | Description |
|---|---|
| txMenubarStart | Content before the items, e.g. a logo |
| txMenubarEnd | Content at the far end, e.g. a search field or an avatar |
| txMenubarItem | `<ng-template txMenubarItem let-item let-hasSubmenu="hasSubmenu">` — own item content, root and submenu items |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus into the bar (one root item is in the tab order) and out of it |
| Right / Left arrow | Next / previous root item; inside a submenu, the next / previous root item with its submenu open |
| Down arrow / Enter / Space | Opens the submenu of a root item and focuses its first item; picks an item without a submenu |
| Up arrow | Opens the submenu and focuses its last item |
| Home / End | First / last root item |
| Escape | Closes the submenu and returns focus to its root item |
| Letters | Moves to the next item starting with that letter |
| Mobile menu | Up / Down move, Right opens a nested list, Left closes it or goes to the parent, Escape closes the menu |
