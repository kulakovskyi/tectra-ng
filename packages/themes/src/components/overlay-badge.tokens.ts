import { tokenRef } from './token-helpers';

export const overlayBadgeTokens = {
  root: {
    ringColor: tokenRef('surface-card'),
    ringWidth: '2px',
    offset: '0px',
    circleOffset: '14%',
  },
};

export type TectraOverlayBadgeTokens = typeof overlayBadgeTokens;
