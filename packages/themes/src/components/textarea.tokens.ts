import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `txTextarea`: colors, sizes and spacing of its root, borderless and counter. */
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

type TextareaTokensShape = typeof textareaTokens;

/** Type of `textareaTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraTextareaTokens extends TextareaTokensShape {}
