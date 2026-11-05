import { tokenRef } from './token-helpers';

export const speedDialTokens = {
  root: {
    gap: '10px',
    duration: '0.22s',
    stagger: '30ms',
  },
  mask: {
    background: tokenRef('mask-background'),
  },
};

export type TectraSpeedDialTokens = typeof speedDialTokens;
