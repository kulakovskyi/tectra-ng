import { tokenRef } from './token-helpers';

export const inputOtpTokens = {
  root: {
    gap: '8px',
    cellWidth: '42px',
    cellFontSize: tokenRef('font-size-lg'),
    cellFontWeight: tokenRef('font-weight-semibold'),
    separatorColor: tokenRef('text-muted'),
    separatorWidth: '12px',
  },
  sm: { cellWidth: '34px', cellFontSize: tokenRef('font-size-md'), gap: '6px' },
  lg: { cellWidth: '52px', cellFontSize: '20px', gap: '10px' },
};

export type TectraInputOtpTokens = typeof inputOtpTokens;
