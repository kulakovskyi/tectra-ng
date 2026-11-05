import { tokenRef } from './token-helpers';

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

export type TectraSpeedDialTokens = typeof speedDialTokens;
