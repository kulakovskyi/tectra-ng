## 0.1.0 (2026-11-06)

First public release.

### Packages

- `tectra-ng` — everything below at one version
- `@tectra-ng/ui` — components, one entry point per component
- `@tectra-ng/core` — `provideTectra`, overlay, accessibility helpers, forms, locale, ripple, styles
- `@tectra-ng/themes` — light and dark themes, `createInkPreset`, `definePreset`, component tokens
- `@tectra-ng/tokens` — palettes, radius, typography, shadows, spacing, motion
- `@tectra-ng/icons` — 334 icons and `TxIcon`
- `@tectra-ng/brand-icons` — brand logos for `TxIcon`

### Components

- **Forms:** input, icon field, input group, key filter, label (float / ifta), field, message, textarea, checkbox, radio button, toggle switch, password, password generator, input OTP, input mask, input number, rating, knob, slider
- **Display:** badge, overlay badge, pill, tag, chip, progress bar, progress spinner, skeleton, avatar, divider, card, panel, fieldset, highlight text, amount, status icon, link
- **Actions:** button, button group, toggle button, split button, speed dial
- **Overlays:** tooltip, popover, toast, dialog, drawer, confirm, menu (menu, tiered menu, context menu)
- **Selection:** select, multiselect, autocomplete, listbox, chips input, color picker, country and country select, mention textarea, email suggestion, tree select, cascade select
- **Data:** paginator, table

Every component is standalone, OnPush and signal-based, themable through `dt`, `pt` and `unstyled`, keyboard accessible and checked with axe in light and dark.
