## 0.1.3 (2026-11-06)

### 🚀 Features

- **ui:** stage 7.5 — timeline ([c4cdfdd](https://github.com/kulakovskyi/tectra-ng/commit/c4cdfdd))
- **ui:** stage 7.6 — stat tiles ([fea9b0a](https://github.com/kulakovskyi/tectra-ng/commit/fea9b0a))
- **ui:** stage 7.7 — sparkline ([2d95b55](https://github.com/kulakovskyi/tectra-ng/commit/2d95b55))
- **ui:** stage 7.8 — export without third-party libraries ([6af37a1](https://github.com/kulakovskyi/tectra-ng/commit/6af37a1))
- **ui:** stage 8.1 — date picker ([93c9f25](https://github.com/kulakovskyi/tectra-ng/commit/93c9f25))
- **ui:** stage 8.2 — month calendar ([152fdd7](https://github.com/kulakovskyi/tectra-ng/commit/152fdd7))
- **ui:** date picker range preview and pickable days of other months ([f86aa19](https://github.com/kulakovskyi/tectra-ng/commit/f86aa19))
- **ui:** stage 8.3 — countdown ([58876d5](https://github.com/kulakovskyi/tectra-ng/commit/58876d5))
- **ui:** stage 8.4 — analog clock ([3f3a4a6](https://github.com/kulakovskyi/tectra-ng/commit/3f3a4a6))

### ❤️ Thank You

- tears @kulakovskyi

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
