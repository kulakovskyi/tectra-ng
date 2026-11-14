import { tokenRef } from './token-helpers';

/** Design tokens of `tx-theme-configurator`: its width, the spacing of its rows and the look of their labels. */
export const themeConfiguratorTokens = {
  root: {
    width: '17.5rem',
    gap: '16px',
    sectionGap: '8px',
    labelColor: tokenRef('text-muted'),
    labelFontSize: tokenRef('font-size-sm'),
    labelFontWeight: tokenRef('font-weight-semibold'),
  },
};

type ThemeConfiguratorTokensShape = typeof themeConfiguratorTokens;

/** Type of `themeConfiguratorTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraThemeConfiguratorTokens extends ThemeConfiguratorTokensShape {}
