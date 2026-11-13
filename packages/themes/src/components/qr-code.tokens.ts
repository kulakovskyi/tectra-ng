import { tokenRef } from './token-helpers';

/** Design tokens of `tx-qr-code`: colors, sizes and spacing of its root and error. */
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

type QrCodeTokensShape = typeof qrCodeTokens;

/** Type of `qrCodeTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraQrCodeTokens extends QrCodeTokensShape {}
