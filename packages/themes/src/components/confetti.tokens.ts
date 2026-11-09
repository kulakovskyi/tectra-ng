import { lightDark, tokenRef } from './token-helpers';

export const confettiTokens = {
  piece: {
    size: '10.5px',
    borderRadius: '2.625px',
    neutralWidth: '7px',
    neutralHeight: '14px',
  },
  colors: {
    accent: tokenRef('primary-base'),
    neutral: tokenRef('text-muted'),
    success: lightDark(tokenRef('green-600'), tokenRef('green-500')),
  },
  motion: {
    duration: '1.1s',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    stagger: '40ms',
  },
};

export type TectraConfettiTokens = typeof confettiTokens;
