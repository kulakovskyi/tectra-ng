import { lightDark, tokenRef } from './token-helpers';

export const galleriaTokens = {
  root: {
    borderWidth: '1px',
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('surface-card'),
    transitionDuration: tokenRef('motion-duration'),
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    slideDuration: '0.45s',
    slideEasing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  navButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    hoverBackground: 'rgba(255, 255, 255, 0.2)',
    color: tokenRef('surface-100'),
    hoverColor: tokenRef('surface-0'),
    size: '36.75px',
    gutter: '7px',
    borderRadius: '50%',
    iconSize: '17.5px',
  },
  thumbnails: {
    background: tokenRef('surface-card'),
    padding: '12.25px 3.5px',
    gap: '3.5px',
    itemOpacity: '0.5',
    itemBorderRadius: tokenRef('radius-md'),
    verticalWidth: '128px',
  },
  thumbnailNavButton: {
    size: '24.5px',
    iconSize: '12.25px',
    borderRadius: tokenRef('radius-lg'),
    gutter: '7px',
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
    color: lightDark(tokenRef('surface-600'), tokenRef('surface-400')),
    hoverColor: lightDark(tokenRef('surface-700'), tokenRef('surface-0')),
  },
  caption: {
    background: 'rgba(0, 0, 0, 0.5)',
    color: tokenRef('surface-100'),
    padding: '12.25px',
  },
  indicatorList: {
    gap: '7px',
    padding: '12.25px',
  },
  indicator: {
    size: '12.25px',
    borderRadius: '50%',
    background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    hoverBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    activeBackground: tokenRef('primary-base'),
  },
  insetIndicator: {
    listBackground: 'rgba(0, 0, 0, 0.5)',
    background: 'rgba(255, 255, 255, 0.4)',
    hoverBackground: 'rgba(255, 255, 255, 0.6)',
    activeBackground: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    size: '36.75px',
    gutter: '7px',
    background: 'rgba(255, 255, 255, 0.1)',
    hoverBackground: 'rgba(255, 255, 255, 0.2)',
    color: tokenRef('surface-50'),
    hoverColor: tokenRef('surface-0'),
    borderRadius: '50%',
    iconSize: '17.5px',
  },
  mask: {
    background: 'rgba(0, 0, 0, 0.9)',
    frameWidth: 'min(calc(100vw - 112px), 960px)',
    imageMaxHeight: '72vh',
    thumbnailNavColor: tokenRef('surface-100'),
    thumbnailNavHoverBackground: 'rgba(255, 255, 255, 0.1)',
  },
  focusRing: {
    width: '2px',
    color: tokenRef('focus-ring-color'),
    offset: '2px',
  },
};

export type TectraGalleriaTokens = typeof galleriaTokens;
