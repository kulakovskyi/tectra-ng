import { fade, lightDark, tokenRef } from './token-helpers';

export const skeletonTokens = {
  root: {
    background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    waveColor: lightDark(fade(tokenRef('surface-0'), '45%'), fade(tokenRef('surface-500'), '75%')),
    borderRadius: tokenRef('radius-md'),
    lineHeight: '12px',
    lineGap: '10px',
    lastLineWidth: '60%',
    circleSize: '40px',
    duration: '1.6s',
  },
  table: {
    rowHeight: '44px',
    cellGap: '16px',
    borderColor: tokenRef('surface-border'),
    headerBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-900')),
  },
};

export type TectraSkeletonTokens = typeof skeletonTokens;
