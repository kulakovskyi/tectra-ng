# Popover

A panel of content next to an element — a share box, a small form, a list of notifications. It opens from a trigger, moves focus inside, and closes on an outside click, Escape or Tab past its last element.

```html
<button txButton [txPopoverTrigger]="share">Share</button>
<tx-popover #share header="Share link" closeButton>
  <input txInput aria-label="Link" value="https://example.com/r/7Q2M" />
</tx-popover>
```

`[txPopoverTrigger]` toggles the popover on click and keeps `aria-expanded` / `aria-controls` in sync. Without a trigger, open it from code: `pop.toggle($event)` anchors it to the clicked element, `pop.show(element)` to any element, `[(open)]` to the last or the first registered trigger. Content inside `<tx-popover>` is created with the page; use `<ng-template txPopoverContent>` to create it on open.

## Inputs
| Name | Description |
|---|---|
| placement | `bottom-start` (default) or any of the 12 placements; flips when there is no room |
| offset | Gap to the element in px (default 10, the arrow fills it) |
| arrow | Shows the arrow: at the middle of the element for a centred placement, near its start or end for `-start` / `-end` (default on; `[arrow]="false"` hides it) |
| header | Title text; also names the dialog |
| closeButton | Shows a close button (translated "Close" label) |
| dismissable | Closes on a click outside (default on) |
| closeOnEscape | Closes on Escape (default on) |
| autoFocus | Where focus goes on open: `first` focusable element (default), the `panel`, or `none` |
| restoreFocus | Focus returns to the element that opened it (default on) |
| scroll | What page scrolling does: `reposition` (default, closes once the element scrolls out of view), `close`, `block`, `none` |
| ariaLabel | Name of the dialog when there is no header |
| ariaLabelledBy | Id of the element that names the dialog |
| panelClass | Class added to the overlay pane |
| open | Two-way open state (`[(open)]`) |
| dt | Design tokens of this popover (`popover`) |
| pt | Classes and styles of the parts: `root`, `header`, `title`, `content`, `footer`, `closeButton`, `arrow` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| opened | The popover opened |
| closed | The popover closed, with the reason: `api`, `escape`, `outside`, `tab`, `scroll`, `detached` |
| openChange | `open` changed |

## Slots
| Name | Description |
|---|---|
| default | Content of the popover |
| txPopoverHeader | `<div txPopoverHeader>` — header content after the `header` text |
| txPopoverFooter | `<div txPopoverFooter>` — actions at the bottom, aligned to the end |
| txPopoverContent | `<ng-template txPopoverContent let-close>` — content created on open; `close()` hides the popover |
| txPopoverTrigger | `[txPopoverTrigger]="popover"` on a button — toggles the popover |

## Methods
| Name | Description |
|---|---|
| show(target?) | Opens at an element, at `event.currentTarget`, or at the last / first trigger |
| hide() | Closes it |
| toggle(target?) | Closes it when open at that target, otherwise opens there |
| updatePosition() | Measures again after the content changed size |
| isOpen | Signal: whether it is open |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the trigger: opens or closes the popover |
| Tab | Moves through the popover; past the last element it closes and focus moves on after the trigger |
| Shift + Tab | Before the first element it closes and focus goes back to the trigger |
| Escape | Closes the popover, focus goes back to the trigger |
