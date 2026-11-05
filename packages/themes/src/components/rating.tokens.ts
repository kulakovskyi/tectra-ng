import { lightDark, tokenRef } from './token-helpers';

export const ratingTokens = {
  root: {
    gap: '4px',
    iconSize: '20px',
    color: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    activeColor: lightDark(tokenRef('orange-400'), tokenRef('orange-400')),
    hoverColor: lightDark(tokenRef('orange-300'), tokenRef('orange-300')),
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
  sm: { iconSize: '16px', gap: '2px' },
  lg: { iconSize: '28px', gap: '6px' },
};

export type TectraRatingTokens = typeof ratingTokens;
