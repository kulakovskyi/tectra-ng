# Style Class

Shows, hides or toggles another element by classes from a button, with enter and leave animations — small menus, collapsible sections, a mobile nav — without writing a component. The target is the next or previous sibling, the parent, the grandparent or any CSS selector. The leave animation finishes before the hiding class lands; animations are skipped with reduced motion. The host gets `aria-expanded`.

```html
<button txButton icon="bars" aria-label="Menu" txStyleClass enterFromClass="hidden" enterActiveClass="fade-in" leaveActiveClass="fade-out" leaveToClass="hidden" hideOnOutsideClick hideOnEscape></button>
<nav class="hidden">…</nav>
```

## Inputs
| Name | Description |
|---|---|
| txStyleClass | Target: `@next` (default), `@prev`, `@parent`, `@grandparent` or a selector |
| enterFromClass | Removed when the target opens (e.g. `hidden`) |
| enterActiveClass | Added while the target opens, until its animation or transition ends |
| enterToClass | Added when the target is open |
| leaveFromClass | Added when the target starts to close |
| leaveActiveClass | Added while the target closes |
| leaveToClass | Added when the target is closed (e.g. `hidden`); also tells that it is closed |
| toggleClass | Just toggles these classes on the target, no open / close |
| hideOnOutsideClick | Closes on a click outside the target and the host |
| hideOnEscape | Closes on Escape and returns the focus to the host |
| hideOnResize | Closes when the window is resized |

## Methods
| Name | Description |
|---|---|
| toggle() / enter() / leave() | Open or close from code (`exportAs: 'txStyleClass'`) |
| expanded | Signal: the target is open |

## Keyboard
| Key | Action |
|---|---|
| Escape | Closes the target, with `hideOnEscape` |
