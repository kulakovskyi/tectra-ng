import { lightDark, tokenRef } from './token-helpers';

export const inputNumberTokens = {
  button: {
    width: '34px',
    stackedWidth: '28px',
    background: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
    activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-600')),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    borderColor: tokenRef('form-field-border-color'),
    iconSize: '12px',
  },
};

export type TectraInputNumberTokens = typeof inputNumberTokens;
