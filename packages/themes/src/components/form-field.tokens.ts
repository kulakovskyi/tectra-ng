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
    placeholderColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
    filledPlaceholderColor: lightDark(tokenRef('surface-600'), tokenRef('surface-300')),
    invalidPlaceholderColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    iconColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
    shadow: tokenRef('shadow-field'),
    borderRadius: tokenRef('radius-md'),
    paddingX: '10.5px',
    paddingY: '7px',
    fontSize: tokenRef('font-size-md'),
    lineHeight: '21px',
    sm: { paddingX: '8.75px', paddingY: '5.25px', fontSize: '12.25px', lineHeight: '18.375px' },
    lg: { paddingX: '12.25px', paddingY: '8.75px', fontSize: '15.75px', lineHeight: '23.625px' },
    focusRing: { shadow: 'none', width: '0px', style: 'none', color: 'transparent', offset: '0px' },
    invalidFocusRing: { shadow: 'none' },
    transitionDuration: tokenRef('motion-duration'),
  },
};

export type TectraFormFieldTokens = typeof formFieldTokens;
