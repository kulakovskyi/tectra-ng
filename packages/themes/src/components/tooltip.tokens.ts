import { lightDark, tokenRef } from './token-helpers';

export const tooltipTokens = {
  root: {
    background: lightDark(tokenRef('surface-900'), tokenRef('surface-700')),
    color: tokenRef('surface-0'),
    maxWidth: '280px',
    padding: '6px 10px',
    borderRadius: tokenRef('radius-md'),
    fontSize: tokenRef('font-size-sm'),
    fontWeight: tokenRef('font-weight-medium'),
    lineHeight: '1.45',
    shadow: tokenRef('shadow-overlay'),
  },
  arrow: {
    size: '8px',
    inset: '10px',
  },
};

export type TectraTooltipTokens = typeof tooltipTokens;
