import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-input-number`: colors, sizes and spacing of its button. */
export const inputNumberTokens = {
  button: {
    width: '34px',
    stackedWidth: '28px',
    background: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
    activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-600')),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    activeColor: tokenRef('input-number-button-hover-color'),
    borderColor: tokenRef('form-field-border-color'),
    iconSize: '12px',
  },
};

type InputNumberTokensShape = typeof inputNumberTokens;

/** Type of `inputNumberTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraInputNumberTokens extends InputNumberTokensShape {}
