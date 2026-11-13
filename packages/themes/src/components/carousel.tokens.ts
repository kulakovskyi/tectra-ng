import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-carousel`: colors, sizes and spacing of its root, content, indicator list and indicator. */
export const carouselTokens = {
  root: {
    transitionDuration: tokenRef('motion-duration'),
    slideDuration: '0.5s',
    slideEasing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  content: {
    gap: '3.5px',
  },
  indicatorList: {
    padding: '14px',
    gap: '7px',
  },
  indicator: {
    width: '24.5px',
    height: '7px',
    hitArea: '24px',
    borderRadius: tokenRef('radius-lg'),
    background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    hoverBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    activeBackground: tokenRef('primary-base'),
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '2px',
  },
};

type CarouselTokensShape = typeof carouselTokens;

/** Type of `carouselTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCarouselTokens extends CarouselTokensShape {}
