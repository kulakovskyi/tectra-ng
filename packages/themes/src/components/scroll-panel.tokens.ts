import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-scroll-panel`: colors, sizes and spacing of its root and bar. */
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

/** Type of `scrollPanelTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraScrollPanelTokens = typeof scrollPanelTokens;
