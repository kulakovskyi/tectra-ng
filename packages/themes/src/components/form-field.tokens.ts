import { lightDark, tokenRef } from './token-helpers';

export const formFieldTokens = {
  root: {
    background: tokenRef('field-background'),
    filledBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
    filledHoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
    filledFocusBackground: lightDark(tokenRef('surface-0'), tokenRef('surface-900')),
    disabledBackground: tokenRef('field-disabled-background'),
    readonlyBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-900')),
    borderColor: tokenRef('field-border'),
    hoverBorderColor: tokenRef('field-hover-border'),
    focusBorderColor: tokenRef('primary-base'),
    invalidBorderColor: tokenRef('danger-base'),
    color: tokenRef('field-color'),
    disabledColor: tokenRef('text-muted'),
    placeholderColor: tokenRef('text-muted'),
    invalidPlaceholderColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    iconColor: tokenRef('text-muted'),
    shadow: tokenRef('shadow-field'),
    borderRadius: tokenRef('radius-md'),
    paddingX: '12px',
    paddingY: '9px',
    fontSize: tokenRef('font-size-md'),
    lineHeight: '17px',
    sm: { paddingX: '10px', paddingY: '6px', fontSize: tokenRef('font-size-sm'), lineHeight: '16px' },
    lg: { paddingX: '14px', paddingY: '11px', fontSize: tokenRef('font-size-lg'), lineHeight: '20px' },
    focusRing: { shadow: 'none' },
    invalidFocusRing: { shadow: 'none' },
    transitionDuration: tokenRef('motion-duration'),
  },
};

export type TectraFormFieldTokens = typeof formFieldTokens;
