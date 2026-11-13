import { joinCss, tokenRef } from './token-helpers';

/** Design tokens of `tx-field`: colors, sizes and spacing of its root and horizontal. */
export const fieldTokens = {
  root: {
    gap: '0px',
  },
  horizontal: {
    columnGap: '16px',
    labelWidth: '180px',
    labelPaddingTop: joinCss('calc(', tokenRef('form-field-padding-y'), ' + 1px)'),
  },
};

type FieldTokensShape = typeof fieldTokens;

/** Type of `fieldTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraFieldTokens extends FieldTokensShape {}
