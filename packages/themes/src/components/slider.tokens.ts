import { fade, lightDark, tokenRef } from './token-helpers';

export const sliderTokens = {
  root: {
    trackSize: '4px',
    trackBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    trackBorderRadius: tokenRef('radius-full'),
    rangeBackground: tokenRef('primary-base'),
    verticalHeight: '180px',
    disabledOpacity: '0.55',
    invalidRangeBackground: tokenRef('form-field-invalid-border-color'),
    transitionDuration: '0.2s',
  },
  handle: {
    size: '18px',
    background: tokenRef('surface-0'),
    hoverBackground: tokenRef('slider-handle-background'),
    borderColor: tokenRef('primary-base'),
    borderWidth: '2px',
    shadow: `0 1px 2px ${fade(tokenRef('surface-950'), '80%')}`,
    hoverRing: `0 0 0 6px ${fade(tokenRef('primary-base'), '85%')}`,
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },
  mark: {
    size: '4px',
    background: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
    activeBackground: tokenRef('primary-contrast'),
    labelColor: tokenRef('text-muted'),
    labelFontSize: tokenRef('font-size-sm'),
    labelGap: '10px',
  },
};

export type TectraSliderTokens = typeof sliderTokens;
