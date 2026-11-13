import { tokenRef } from './token-helpers';

/** Design tokens of `tx-overlay-badge`: its colors, sizes and spacing. */
export const overlayBadgeTokens = {
  root: {
    ringColor: tokenRef('surface-card'),
    ringWidth: '2px',
    offset: '0px',
    circleOffset: '14%',
  },
};

/** Type of `overlayBadgeTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraOverlayBadgeTokens = typeof overlayBadgeTokens;
