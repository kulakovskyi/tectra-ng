import { tokenRef } from './token-helpers';

export const fieldTokens = {
  root: {
    gap: '0px',
  },
  horizontal: {
    columnGap: '16px',
    labelWidth: '180px',
    labelPaddingTop: `calc(${tokenRef('form-field-padding-y')} + 1px)`,
  },
};

export type TectraFieldTokens = typeof fieldTokens;
