# ButtonGroup

Joins related `txButton` buttons into one block: the inner corners go square, neighbouring borders merge into one line, and only the outer corners stay rounded. Use it for a few actions on the same object (save / delete / cancel), for a pager or a zoom control, or as the base of a split button. For a choice between options that stays selected use `tx-select-button` or `tx-tabs` instead — a button group only triggers actions.

Solid buttons next to each other get a thin divider in their own text colour, faded (`buttonGroup.dividerColor` and `buttonGroup.dividerWidth` tokens), so the group does not read as one wide button; outlined buttons share their border instead. The divider sits on the shared edge and stays in place while either neighbour is hovered or pressed.

Every button keeps its own inputs: severity, size, variant, icon, badge, loading and disabled work inside a group as they do alone. Give all buttons of a group the same size and variant.

```html
<tx-button-group aria-label="Document actions">
  <button txButton icon="check">Save</button>
  <button txButton icon="trash">Delete</button>
  <button txButton icon="times">Cancel</button>
</tx-button-group>
```

## Inputs
| Name | Description |
|---|---|
| orientation | `horizontal` (default) puts the buttons in a row, `vertical` stacks them in a column with the divider between rows |
| fluid | The group takes the full width of its container and the buttons share it equally; without the input it follows a parent `<tx-fluid>` |
| dt | Design tokens of this one group, e.g. `{ root: { dividerColor: 'var(--tx-surface-0)', dividerWidth: '2px' } }` |
| pt | Extra `class` / `style` for the `root` part — an object or a function `({ instance }) => ({ class, style })` |
| ptOptions | How this `pt` meets the global one from `provideTectra({ pt })`: `mergeSections` (default `true`), `mergeProps` (default `false`) |
| unstyled | Drops the joined borders, square inner corners and the divider; the classes `tx-button-group`, `tx-button-group--vertical` and `tx-button-group--fluid` stay for your own CSS; default from `provideTectra({ unstyled })` |

## Slots
| Name | Description |
|---|---|
| default | The `txButton` buttons (`button` or `a`) of the group |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus from one button to the next; disabled buttons are skipped |
| Enter / Space | Triggers the focused button |

## Accessibility

The host has `role="group"`. Give it a name with `aria-label` (or `aria-labelledby`) when the buttons alone do not say what they act on, and give icon-only buttons their own `aria-label`. A focused or hovered button is drawn above its neighbours, so the focus ring is never cut by the next button.
