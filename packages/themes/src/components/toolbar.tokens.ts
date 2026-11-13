import { tokenRef } from './token-helpers';

/** Design tokens of `tx-toolbar`: colors, sizes and spacing of its root and group. */
export const toolbarTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    gap: '7px',
    padding: '8.75px',
  },
  group: {
    gap: '7px',
  },
};

/** Type of `toolbarTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraToolbarTokens = typeof toolbarTokens;
