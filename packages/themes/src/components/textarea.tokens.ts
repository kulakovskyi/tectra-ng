import { lightDark, tokenRef } from './token-helpers';

export const textareaTokens = {
  root: {
    minHeight: '80px',
  },
  borderless: {
    background: 'transparent',
    focusBackground: 'transparent',
  },
  counter: {
    color: tokenRef('text-muted'),
    limitColor: lightDark(tokenRef('red-700'), tokenRef('red-400')),
    fontSize: tokenRef('font-size-sm'),
    marginTop: '6px',
  },
};

export type TectraTextareaTokens = typeof textareaTokens;
