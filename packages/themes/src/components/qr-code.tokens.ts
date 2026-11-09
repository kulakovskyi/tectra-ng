import { tokenRef } from './token-helpers';

export const qrCodeTokens = {
  root: {
    color: tokenRef('surface-950'),
    background: tokenRef('surface-0'),
    borderRadius: tokenRef('radius-lg'),
  },
  error: {
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
  },
};

export type TectraQrCodeTokens = typeof qrCodeTokens;
