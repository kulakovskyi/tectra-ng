import { tokenRef } from './token-helpers';

/** Design tokens of `tx-input-group`: colors, sizes and spacing of its addon. */
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

type InputGroupTokensShape = typeof inputGroupTokens;

/** Type of `inputGroupTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraInputGroupTokens extends InputGroupTokensShape {}
