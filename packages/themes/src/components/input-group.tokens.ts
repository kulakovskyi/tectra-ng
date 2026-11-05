import { tokenRef } from './token-helpers';

export const inputGroupTokens = {
  addon: {
    background: tokenRef('form-field-filled-background'),
    borderColor: tokenRef('form-field-border-color'),
    color: tokenRef('text-muted'),
    borderRadius: tokenRef('form-field-border-radius'),
    paddingX: '12px',
    minWidth: '37px',
  },
};

export type TectraInputGroupTokens = typeof inputGroupTokens;
