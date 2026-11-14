---
category: Blocks
tokens: themeConfigurator, colorSwatches
source: packages/blocks/theme-configurator
package: @tectra-ng/blocks/theme-configurator
examples: basic, popover, choices, design-tokens
---
# Theme Configurator

Theme settings people change at run time — primary color, surface palette, style and the click ripple. Each pick rebuilds the theme through `TxThemeService.updateTheme`; with `storageKey` in `provideTectra` the choice is remembered and restored before the first render.

A block from `@tectra-ng/blocks` — it comes with `tectra-ng`, or alone: `npm install @tectra-ng/blocks`.
