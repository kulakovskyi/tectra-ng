<p align="center">
  <a href="https://tectra-ng.com">
    <img src="https://tectra-ng.com/images/social-preview.png" alt="tectra — Angular UI component library" width="100%" />
  </a>
</p>

<p align="center">
  <b>Open-source Angular UI kit for consoles and admin apps.</b><br />
  Design tokens, themes, 80+ components, charts and ready page blocks — built on signals, rendered on the server.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tectra-ng"><img src="https://img.shields.io/npm/v/tectra-ng?color=2560e4&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/tectra-ng"><img src="https://img.shields.io/npm/dm/tectra-ng?color=2560e4" alt="npm downloads" /></a>
  <a href="https://github.com/kulakovskyi/tectra-ng/actions/workflows/ci.yml"><img src="https://github.com/kulakovskyi/tectra-ng/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/kulakovskyi/tectra-ng/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-2560e4" alt="MIT license" /></a>
  <a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-22-dd0031?logo=angular&logoColor=white" alt="Angular 22" /></a>
  <a href="https://www.bestpractices.dev/projects/16576"><img src="https://www.bestpractices.dev/projects/16576/badge" alt="OpenSSF Best Practices" /></a>
  <a href="https://www.bestpractices.dev/projects/16576/baseline-2"><img src="https://www.bestpractices.dev/projects/16576/baseline" alt="OpenSSF Baseline" /></a>
</p>

<p align="center">
  <a href="https://tectra-ng.com"><b>Documentation</b></a>
  &nbsp;·&nbsp;
  <a href="https://tectra-ng.com/getting-started">Getting started</a>
  &nbsp;·&nbsp;
  <a href="https://tectra-ng.com/theming">Theming</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/kulakovskyi/tectra-ng">GitHub</a>
</p>

## Why tectra

- **Everything in one kit** — 80+ components, 22 page blocks, 23 SVG charts, 334 icons, brand logos and country flags.
- **Modern Angular only** — standalone, signal inputs and models, OnPush, zoneless.
- **Server rendering out of the box** — every component prerenders and hydrates without a layout jump.
- **Your design, from tokens** — light and dark mode, 4 styles, 17 primary colours and 13 surfaces; `dt`, `pt` and `unstyled` on every component.
- **Accessible** — WAI-ARIA patterns, full keyboard support, axe-checked in light and dark.
- **Tree-shakable** — one entry point per component, chart and utility.

## Install

```bash
ng add tectra-ng
```

It installs every tectra package at the same version with the Angular peers, adds `provideTectra` with the preset you pick (`--style`, `--primary`, `--surface`) to `app.config.ts` and the fonts to `index.html`.

Without the Angular CLI, install it and provide a theme by hand:

```bash
npm i tectra-ng
```

Then import components from the packages themselves:

```ts
import { provideTectra } from '@tectra-ng/core/config';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';
import { createTectraPreset } from '@tectra-ng/themes';

export const appConfig: ApplicationConfig = {
  providers: [provideTectra({ preset: createTectraPreset({ primary: 'blue' }) }), provideTxIcons(TX_ICONS)],
};
```

```ts
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  imports: [TxButton],
  template: `<button txButton label="Save" (click)="save()"></button>`,
})
export class SaveAction {
  save(): void {}
}
```

## Packages

| Package | What it holds |
|---|---|
| `@tectra-ng/ui` | Components, one entry point per component: `@tectra-ng/ui/button`, `@tectra-ng/ui/select`, … |
| `@tectra-ng/blocks` | Ready page blocks, one entry point per block: `@tectra-ng/blocks/filters-panel`, … |
| `@tectra-ng/core` | `provideTectra`, overlay, accessibility helpers, forms, locale |
| `@tectra-ng/themes` | Light and dark themes, presets, component tokens |
| `@tectra-ng/tokens` | Design tokens: palettes, radius, typography, shadows, motion |
| `@tectra-ng/icons` | Icon set and `TxIcon` |
| `@tectra-ng/brand-icons` | Brand logos for `TxIcon` |
| `@tectra-ng/flags` | Country flags for `TxCountry` and `TxCountrySelect` |
| `@tectra-ng/charts` | SVG charts without a chart library, one entry point per chart: `@tectra-ng/charts/line`, `/column`, `/combo`, `/scatter`, `/pie`, `/radar`, `/radial-bar`, `/gauge`, `/funnel`, `/waterfall`, `/bullet`, `/candlestick`, `/boxplot`, `/range-area`, `/gantt`, `/sankey`, `/sunburst`, `/bar-list`, `/segmented-bar`, `/heatmap`, `/treemap`, `/rank-line`, `/org-chart`, `/core` |
| `@tectra-ng/utils` | Pipes, directives, validators and helpers next to the components, one entry point per utility: `@tectra-ng/utils/date`, … |
| `@tectra-ng/qr` | QR codes with no dependencies — the engine of `@tectra-ng/blocks/qr-code`, usable without Angular too |

Need only part of it? Install a package on its own — `npm i @tectra-ng/ui` brings `core`, `themes`, `tokens` and `icons` with it.

The rich text editor is not part of `tectra-ng` — it carries the ProseMirror engine, so it is installed only where it is used:

```bash
npm i @tectra-ng/editor
```

The code editor is not part of `tectra-ng` either — it carries the CodeMirror core:

```bash
npm i @tectra-ng/code-editor
```

Upgrading from 0.2: [UPGRADING.md](https://github.com/kulakovskyi/tectra-ng/blob/main/UPGRADING.md).

Docs and examples: [tectra-ng.com](https://tectra-ng.com) · MIT license.
