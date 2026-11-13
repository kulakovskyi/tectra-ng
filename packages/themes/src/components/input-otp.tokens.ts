import { tokenRef } from './token-helpers';

/** Design tokens of `tx-input-otp`: its colors, sizes and spacing, plus the `sm` and `lg` sizes. */
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

/** Type of `inputOtpTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraInputOtpTokens = typeof inputOtpTokens;
