# Button

Triggers an action. The text goes into `label` or inside the button. An attribute on a native `button` or `a`, so the native behaviour stays: `type`, `href`, `aria-label`, `autofocus`, `(click)`, `(focus)`, `(blur)`, `class`, `style`. Every visual value comes from the `button` design tokens of the preset (see the Theming tab).

## Inputs
| Name | Description |
|---|---|
| label | Text of the button; the same as text placed inside the button (both can be combined) |
| severity | Meaning of the action: `primary` main, `secondary` neutral, `success`, `info`, `warn`, `danger` destructive, `help`, `contrast` |
| size | `small`, `medium`, `large` |
| variant | `outlined`, `text` or `link`; wins over the boolean shortcuts below |
| outlined | Shortcut for `variant="outlined"` — border, no fill |
| text | Shortcut for `variant="text"` — no border, no fill |
| link | Shortcut for `variant="link"` — looks like a link |
| rounded | Fully rounded corners |
| raised | Adds a shadow |
| plain | Grey colours for an outlined or text button |
| fluid | Takes the full width of its container; without the input it follows a parent `<tx-fluid>` |
| disabled | Blocks the button: the native `disabled` on a `button`, `aria-disabled` + no tab stop on an `a` |
| tabindex | Tab order; an `a` that is disabled always gets `-1` |
| icon | A `@tectra/icons` name (`'plus'`), an icon registered with `provideTxIcons` (brand logos from `@tectra/brand-icons`: `'github'`), or any icon class (`'pi pi-check'`) |
| iconPos | Where the icon sits: `left`, `right`, `top`, `bottom` |
| iconOnly | Square button with only the icon. Not needed in most cases: a button with an icon and no text becomes square by itself. Give it an `aria-label` |
| loading | Shows a spinning icon, disables the button and sets `aria-busy` |
| loadingIcon | Icon shown while loading — a `@tectra/icons` name or any icon class |
| badge | Counter after the text, rendered with `<tx-badge>` |
| badgeSeverity | Colour of the badge |
| dt | Design tokens of this one button, e.g. `{ root: { primary: { background: '#0d9488' } } }` — same shape as the preset tokens |
| pt | Extra `class` / `style` for the parts `root`, `icon`, `loadingIcon`, `label`, `badge` — an object or a function `({ instance }) => ({ class, style })` that reacts to the button state |
| ptOptions | How this `pt` meets the global one from `provideTectra({ pt })`: `mergeSections` (default `true` — keep global parts this `pt` does not mention), `mergeProps` (default `false` — a local part replaces the global one; `true` joins classes and styles) |
| unstyled | Drops all tectra styles, the classes stay for your own CSS; default from `provideTectra({ unstyled })` |

## Slots
| Name | Description |
|---|---|
| txButtonIcon | `<ng-template txButtonIcon>` — own markup of the icon (any icon set, an image) |
| txButtonLoadingIcon | `<ng-template txButtonLoadingIcon>` — own markup of the loading indicator |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Triggers the button (native behaviour) |
| Tab | Moves focus to the button; a disabled `button` or `a` is skipped |
