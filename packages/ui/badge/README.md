# Badge

A small status or counter. Without a `value` it renders as a dot.

## Inputs
| Name | Description |
|---|---|
| value | Text or number inside; empty = a dot |
| severity | Colour: `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast` |
| size | `small`, `medium`, `large`, `xlarge` |
| dt | Design tokens of this one badge, e.g. `{ primary: { background: '#0d9488' } }` |
| pt | Extra `class` / `style` for the `root` part — an object or a function `({ instance }) => ({ class, style })` |
| ptOptions | How this `pt` meets the global one from `provideTectra({ pt })`: `mergeSections` (default `true` — keep global parts this `pt` does not mention), `mergeProps` (default `false` — a local part replaces the global one; `true` joins classes and styles) |
| unstyled | Drops all tectra styles; classes stay for your own CSS |

## Keyboard
| Key | Action |
|---|---|
| — | Not focusable |
