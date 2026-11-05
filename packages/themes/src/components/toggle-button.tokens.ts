import { lightDark, tokenRef } from './token-helpers';

export const toggleButtonTokens = {
  root: {
    padding: '4px',
    borderRadius: tokenRef('radius-md'),
    gap: '8px',
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
    background: lightDark(tokenRef('surface-100'), tokenRef('surface-950')),
    checkedBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-950')),
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-950')),
    borderColor: lightDark(tokenRef('surface-200'), tokenRef('surface-800')),
    checkedBorderColor: lightDark(tokenRef('surface-200'), tokenRef('surface-800')),
    color: lightDark(tokenRef('surface-600'), tokenRef('surface-400')),
    hoverColor: lightDark(tokenRef('surface-800'), tokenRef('surface-300')),
    checkedColor: lightDark(tokenRef('surface-900'), tokenRef('surface-0')),
    disabledBackground: tokenRef('field-disabled-background'),
    disabledBorderColor: tokenRef('field-disabled-background'),
    disabledColor: tokenRef('text-muted'),
    invalidBorderColor: tokenRef('danger-base'),
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '2px' },
    transitionDuration: tokenRef('motion-duration'),
    sm: { fontSize: tokenRef('font-size-sm'), padding: '3px' },
    lg: { fontSize: tokenRef('font-size-lg'), padding: '5px' },
  },
  icon: {
    color: lightDark(tokenRef('surface-600'), tokenRef('surface-400')),
    hoverColor: lightDark(tokenRef('surface-700'), tokenRef('surface-300')),
    checkedColor: lightDark(tokenRef('surface-900'), tokenRef('surface-0')),
    disabledColor: tokenRef('text-muted'),
  },
  content: {
    padding: '4px 10px',
    borderRadius: tokenRef('radius-sm'),
    checkedBackground: lightDark(tokenRef('surface-0'), tokenRef('surface-800')),
    checkedShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.02), 0px 1px 2px 0px rgba(0, 0, 0, 0.04)',
    sm: { padding: '3px 8px' },
    lg: { padding: '5px 12px' },
  },
};

export type TectraToggleButtonTokens = typeof toggleButtonTokens;
