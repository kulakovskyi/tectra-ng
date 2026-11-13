import { mix, tokenRef } from './token-helpers';

/** Design tokens of `tx-topbar-preferences`: colors, sizes and spacing of its root, raised, divider and stacked. */
export const topbarPreferencesTokens = {
  root: {
    gap: '3.5px',
    padding: '3px',
    borderRadius: tokenRef('radius-full'),
    background: tokenRef('surface-ground'),
    ringColor: tokenRef('surface-border'),
    controlSize: '31px',
    themeHoverBackground: tokenRef('surface-card'),
  },
  raised: {
    background: tokenRef('surface-card'),
    ringColor: mix(tokenRef('text-primary'), '14%', 'transparent'),
    shadow: '0 1px 2px rgb(0 0 0 / 0.06)',
    thumbBackground: mix(tokenRef('primary-base'), '12%', tokenRef('surface-card')),
    thumbRingColor: mix(tokenRef('primary-base'), '28%', 'transparent'),
    activeColor: tokenRef('primary-base'),
    themeHoverBackground: tokenRef('surface-hover'),
  },
  divider: {
    width: '1px',
    height: '14px',
    color: tokenRef('surface-border'),
  },
  stacked: {
    gap: '14px',
    rowPadding: '7px 0',
    labelFontSize: '12.25px',
    labelFontWeight: tokenRef('font-weight-medium'),
    labelColor: tokenRef('text-muted'),
  },
};

type TopbarPreferencesTokensShape = typeof topbarPreferencesTokens;

/**
 * Type of `topbarPreferencesTokens`: the shape of the component tokens that presets and `dt` overrides can
 * change.
 */
export interface TectraTopbarPreferencesTokens extends TopbarPreferencesTokensShape {}
