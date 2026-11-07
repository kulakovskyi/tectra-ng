import { tokenRef } from './token-helpers';

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

export type TectraToolbarTokens = typeof toolbarTokens;
