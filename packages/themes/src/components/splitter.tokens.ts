import { tokenRef } from './token-helpers';

export const splitterTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-md'),
    color: tokenRef('text-primary'),
    transitionDuration: tokenRef('motion-duration'),
  },
  gutter: {
    background: tokenRef('surface-border'),
    hitArea: '5px',
    disabledOpacity: '0.4',
  },
  handle: {
    size: '24px',
    background: 'transparent',
    borderRadius: tokenRef('radius-lg'),
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '2px',
  },
};

export type TectraSplitterTokens = typeof splitterTokens;
