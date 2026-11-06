## 0.1.2 (2026-11-06)

### 🚀 Features

- **docs:** blocks logo that waves, wordmark and favicon ([db8c849](https://github.com/kulakovskyi/tectra-ng/commit/db8c849))
- **flags:** @tectra-ng/flags — country flags as lazy SVG chunks ([8bb0f09](https://github.com/kulakovskyi/tectra-ng/commit/8bb0f09))
- **themes:** theme picker with primaries, surfaces and four themes ([8fd6066](https://github.com/kulakovskyi/tectra-ng/commit/8fd6066))
- **ui:** stage 7.3 — tree and tree table ([d618122](https://github.com/kulakovskyi/tectra-ng/commit/d618122))
- **ui:** stage 7.4 — data view and virtual scroller ([8aa6549](https://github.com/kulakovskyi/tectra-ng/commit/8aa6549))

### 🩹 Fixes

- **docs:** smooth dark mode reveal, remembered mode, real version badge ([d4b612c](https://github.com/kulakovskyi/tectra-ng/commit/d4b612c))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.1 (2026-11-06)

### 🩹 Fixes

- **release:** the changelog step reads its git options from release.changelog.git

### ❤️ Thank You

- tears

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
