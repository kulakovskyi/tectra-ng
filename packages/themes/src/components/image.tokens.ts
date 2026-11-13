import { tokenRef } from './token-helpers';

/** Design tokens of `tx-image`: colors, sizes and spacing of its root, preview, toolbar and action. */
export const imageTokens = {
  root: {
    transitionDuration: tokenRef('motion-duration'),
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  preview: {
    iconSize: '17.5px',
    maskBackground: tokenRef('mask-background'),
    maskColor: tokenRef('surface-200'),
    background: tokenRef('mask-background'),
  },
  toolbar: {
    top: '14px',
    right: '14px',
    blur: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: '1px',
    borderRadius: '30px',
    padding: '7px',
    gap: '7px',
  },
  action: {
    size: '36.75px',
    iconSize: '17.5px',
    borderRadius: '50%',
    color: tokenRef('surface-50'),
    hoverColor: tokenRef('surface-0'),
    hoverBackground: 'rgba(255, 255, 255, 0.1)',
    disabledOpacity: '0.5',
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '2px',
  },
};

type ImageTokensShape = typeof imageTokens;

/** Type of `imageTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraImageTokens extends ImageTokensShape {}
