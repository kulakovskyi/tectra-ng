import { lightDark, tokenRef } from './token-helpers';

export const scrollPanelTokens = {
  root: {
    transitionDuration: tokenRef('motion-duration'),
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '-2px',
  },
  bar: {
    size: '9px',
    borderRadius: tokenRef('radius-sm'),
    background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '2px',
  },
};

export type TectraScrollPanelTokens = typeof scrollPanelTokens;
