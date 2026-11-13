import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `txTooltip`: colors, sizes and spacing of its root, multiline and arrow. */
export const tooltipTokens = {
  root: {
    background: lightDark(tokenRef('surface-900'), tokenRef('surface-50')),
    color: lightDark(tokenRef('surface-0'), tokenRef('surface-950')),
    maxWidth: '252px',
    padding: '5.25px 8.75px',
    borderRadius: tokenRef('radius-lg'),
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-regular'),
    lineHeight: '1.45',
    shadow: tokenRef('shadow-overlay'),
  },
  multiline: {
    maxWidth: '360px',
    lineHeight: '1.5',
  },
  arrow: {
    size: '5px',
    inset: '10px',
  },
};

type TooltipTokensShape = typeof tooltipTokens;

/** Type of `tooltipTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraTooltipTokens extends TooltipTokensShape {}
