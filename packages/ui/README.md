# @tectra-ng/ui

Angular components of tectra — standalone, signals, OnPush, accessible, themable with design tokens. One npm package, one entry point per component: `import { TxSelect } from '@tectra-ng/ui/select'` puts only the select into the bundle.

```bash
npm i @tectra-ng/ui @tectra-ng/core @tectra-ng/themes @tectra-ng/icons
```

`@tectra-ng/core`, `@tectra-ng/themes`, `@tectra-ng/tokens` and `@tectra-ng/icons` are its peer dependencies; the app imports the theme and icons from `core`, `themes` and `icons`, so list them too; `@angular/cdk`, `@angular/forms` and `@angular/common` are needed too, `@angular/router` only for router links.

```ts
// app.config.ts
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';

export const appConfig = { providers: [provideTectra({ preset: Tectra })] };
```

```ts
import { TxButton } from '@tectra-ng/ui/button';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
```

Every component takes `dt` (design tokens of this instance), `pt` / `ptOptions` (classes and styles of its parts) and `unstyled`; form fields work with reactive forms, `ngModel` and signal forms. Docs, examples and the API of each entry point: [tectra-ng.com](https://tectra-ng.com).

## Entry points

| Group | `@tectra-ng/ui/…` |
|---|---|
| Form | `autocomplete`, `cascade-select`, `checkbox`, `chips-input`, `color-picker`, `country-select`, `datepicker`, `email-suggestion`, `field`, `icon-field`, `input`, `input-group`, `input-mask`, `input-number`, `input-otp`, `key-filter`, `knob`, `label`, `list-input`, `listbox`, `mention-textarea`, `multiselect`, `password`, `password-generator`, `radio-button`, `rating`, `select`, `slider`, `textarea`, `toggle-button`, `toggle-switch`, `tree-select` |
| Actions | `button`, `button-group`, `speed-dial`, `split-button` |
| Data | `data-view`, `export`, `month-calendar`, `paginator`, `sparkline`, `stat-tiles`, `table`, `timeline`, `tree`, `tree-table`, `virtual-scroller` |
| Overlay | `confirm`, `dialog`, `drawer`, `menu`, `popover`, `toast`, `tooltip` |
| Display | `amount`, `avatar`, `badge`, `chip`, `country`, `highlight-text`, `link`, `overlay-badge`, `pill`, `status-icon`, `tag`, `truncate-text` |
| Feedback | `message`, `progress-bar`, `progress-spinner`, `skeleton` |
| Layout | `card`, `divider`, `fieldset`, `panel` |
| Misc | `analog-clock`, `countdown` |
| Assets | `export-font` — Onest (SIL Open Font License, see `export-font/OFL.txt`) for PDF export, loaded by `@tectra-ng/ui/export` on the first PDF export |

Each entry point has its own `README.md` with the inputs, outputs, slots and keyboard map.

## License

MIT. The Onest font in `export-font` is © The Onest Project Authors, SIL Open Font License 1.1.
