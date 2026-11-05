import { lightDark, tokenRef } from './token-helpers';

export const ratingTokens = {
  root: {
    gap: '2px',
    iconSize: '22px',
    color: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    activeColor: tokenRef('orange-400'),
    hoverColor: tokenRef('orange-300'),
    hoverScale: '1.15',
    disabledOpacity: '0.5',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingWidth: '2px',
    focusRingOffset: '3px',
    borderRadius: tokenRef('radius-sm'),
    clearGap: '10px',
    clearColor: tokenRef('text-muted'),
    clearHoverColor: tokenRef('text-primary'),
    clearFontSize: tokenRef('font-size-sm'),
    transitionDuration: tokenRef('motion-duration'),
  },
  sm: { iconSize: '16px', gap: '1px' },
  lg: { iconSize: '30px', gap: '4px' },
};

export type TectraRatingTokens = typeof ratingTokens;
