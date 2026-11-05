# Drawer

A panel that slides in from an edge of the screen — filters, details of a row, settings, navigation on small screens. It works like a dialog: focus stays inside, Escape and a click on the mask close it, focus goes back to the button.

```html
<button txButton icon="filter" (click)="filters.set(true)">Filters</button>
<tx-drawer header="Filters" [(visible)]="filters">
  …
  <div txDrawerFooter>
    <button txButton txDialogClose>Apply</button>
  </div>
</tx-drawer>
```

Open a component as a drawer from code with `TxDialogService.open(Component, { drawer: 'right', drawerSize: 'large', data })` — everything from the Dialog page applies (`TxDialogRef`, `injectDialogData`, `tx-dialog-header`, `txDialogClose`).

## Inputs
| Name | Description |
|---|---|
| visible | Two-way open state (`[(visible)]`) |
| header | Title; also names the drawer |
| position | Edge it slides from: `left`, `right` (default), `top`, `bottom` |
| size | `small` (320px), `medium` (440px, default), `large` (640px), `full` or a CSS length — width for left / right (the whole screen below 640px), height for top / bottom |
| modal | Dims the page and keeps focus inside (default on) |
| closable | Close button, Escape and a click on the mask close it (default on) |
| dismissable | Overrides `closable` for a click on the mask |
| closeOnEscape | Overrides `closable` for Escape |
| blockScroll | Stops the page from scrolling while open (default on, modal only) |
| autoFocus | `first` focusable field (default), `dialog`, `none` or a CSS selector |
| restoreFocus | Focus goes back to the element that opened it (default on) |
| ariaLabel | Name when there is no header |
| panelClass | Class on the drawer panel |
| dt | Design tokens of this drawer (`dialog`, drawer sizes under `drawer`) |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| opened | The drawer opened |
| closed | The drawer closed |
| visibleChange | `visible` changed |

## Slots
| Name | Description |
|---|---|
| default | Content; it scrolls between the header and the footer |
| txDrawerHeader | `<div txDrawerHeader>` — more header content after the title |
| txDrawerFooter | `<div txDrawerFooter>` — actions at the bottom |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves focus inside the drawer only (modal) |
| Escape | Closes the drawer (when `closable`) |
