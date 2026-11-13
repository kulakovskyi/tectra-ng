import { tokenRef } from './token-helpers';

/** Design tokens of `tx-splitter`: colors, sizes and spacing of its root, gutter and handle. */
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

type SplitterTokensShape = typeof splitterTokens;

/** Type of `splitterTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraSplitterTokens extends SplitterTokensShape {}
