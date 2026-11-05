# Tooltip

A short hint next to an element — on hover, on keyboard focus, or opened from code. Text or a template; it flips to the other side when there is no room.

```html
<button txButton icon="trash" [text]="true" txTooltip="Delete"></button>
<input txInput txTooltip="Letters and digits only" tooltipEvent="focus" aria-label="Username" />
```

A text tooltip is always available to screen readers: it describes the element (`aria-describedby`) and names it when the element has no name of its own, so an icon-only button with a tooltip needs no `aria-label`. Put tooltips on focusable elements so keyboard users can reach them. Text is shown as text, never as HTML — use a template for rich content.

App-wide defaults: `provideTxTooltip({ placement: 'bottom', showDelay: 400 })`.

## Inputs
| Name | Description |
|---|---|
| txTooltip | Text (a new line with `\n`) or an `<ng-template>`; empty — no tooltip |
| tooltipPlacement | `top` (default), `bottom`, `left`, `right`, each with `-start` / `-end`; flips when there is no room |
| tooltipEvent | `both` (hover and keyboard focus, default), `hover`, `focus` (any focus — hints on fields), `manual` (only `show()` / `hide()`) |
| tooltipShowDelay | Milliseconds before it shows (default 0); no delay while another tooltip was just open |
| tooltipHideDelay | Milliseconds before it hides (default 0) |
| tooltipLife | Hides by itself after this many milliseconds |
| tooltipOffset | Gap to the element in px (default 3.5 — the arrow fills it) |
| tooltipArrow | Shows the arrow pointing at the middle of the element (default on) |
| tooltipInteractive | The pointer can move onto the tooltip without closing it — to select or copy its text (default off) |
| tooltipDisabled | Turns the tooltip off |
| tooltipOverflowOnly | Shows only when the element's text is cut off (`text-overflow: ellipsis`) |
| tooltipContext | Value passed to the template as `$implicit` |
| tooltipClass | Class added to the tooltip panel |
| tooltipDt | Design tokens of this tooltip (`tooltip`) |
| tooltipPt | Classes and styles of the parts: `root`, `content`, `arrow` |
| tooltipPtOptions | How `tooltipPt` merges with the global pass-through |
| tooltipUnstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| tooltipShown | The tooltip opened |
| tooltipHidden | The tooltip closed |

## Slots
| Name | Description |
|---|---|
| template | `[txTooltip]="tpl"` with `<ng-template #tpl let-data let-close="close">` — `data` is `tooltipContext`, `close()` hides the tooltip |

## Methods
| Name | Description |
|---|---|
| show(delay?) | Opens the tooltip (`#tip="txTooltip"`, then `tip.show()`) |
| hide(delay?) | Closes it after the hide delay |
| hideNow() | Closes it at once |
| toggle() | Opens or closes it |
| isOpen | Signal: whether it is open |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focusing the element shows its tooltip, leaving hides it |
| Escape | Hides the tooltip; it stays hidden until the element is hovered or focused again |
