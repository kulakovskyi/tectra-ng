import { tokenRef } from './token-helpers';

export const passwordTokens = {
  root: {
    actionGap: '2px',
    actionInset: '8px',
  },
  panel: {
    padding: '12px 14px',
    gap: '8px',
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-sm'),
  },
  meter: {
    height: '6px',
    borderRadius: tokenRef('radius-full'),
    background: tokenRef('surface-border'),
    weakBackground: tokenRef('danger-base'),
    mediumBackground: tokenRef('warn-base'),
    strongBackground: tokenRef('success-base'),
    transitionDuration: '0.25s',
  },
};

export type TectraPasswordTokens = typeof passwordTokens;
