import { tokenRef } from './token-helpers';

/** Design tokens of `tx-speed-dial`: colors, sizes and spacing of its root and mask. */
export const speedDialTokens = {
  root: {
    gap: '7px',
    duration: '0.15s',
    stagger: '30ms',
  },
  mask: {
    background: tokenRef('mask-background'),
  },
};

/** Type of `speedDialTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraSpeedDialTokens = typeof speedDialTokens;
