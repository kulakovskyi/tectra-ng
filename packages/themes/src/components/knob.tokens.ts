import { lightDark, tokenRef } from './token-helpers';

export const knobTokens = {
  root: {
    valueColor: tokenRef('primary-base'),
    rangeColor: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    limitColor: lightDark(tokenRef('red-200'), tokenRef('red-900')),
    textColor: tokenRef('text-primary'),
    textFontSize: '20cqw',
    textFontWeight: tokenRef('font-weight-semibold'),
    handleColor: tokenRef('surface-0'),
    handleBorderColor: tokenRef('primary-base'),
    disabledOpacity: '0.55',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingWidth: '2px',
    focusRingOffset: '4px',
    transitionDuration: tokenRef('motion-duration'),
  },
};

export type TectraKnobTokens = typeof knobTokens;
