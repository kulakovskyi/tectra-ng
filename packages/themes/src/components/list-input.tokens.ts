import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-list-input`: colors, sizes and spacing of its root, field, footer, hint and unrecognized. */
export const listInputTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderWidth: '1px',
    borderRadius: tokenRef('radius-lg'),
    focusBorderColor: tokenRef('primary-base'),
    focusBorderWidth: '2px',
    invalidBorderColor: tokenRef('danger-base'),
    disabledOpacity: '0.6',
    transitionDuration: tokenRef('motion-duration'),
  },
  field: {
    minHeight: '128px',
    padding: '12px 16px',
    fontFamily: tokenRef('font-mono'),
    fontSize: tokenRef('font-size-sm'),
    lineHeight: '1.625',
    color: tokenRef('text-primary'),
    placeholderColor: tokenRef('form-field-placeholder-color'),
  },
  footer: {
    padding: '8px 12px',
    gap: '8px',
    background: tokenRef('surface-ground'),
    borderColor: tokenRef('surface-border'),
    statsGap: '6px',
    statsPaddingStart: '4px',
    actionsGap: '4px',
  },
  hint: {
    fontSize: tokenRef('font-size-sm'),
    color: tokenRef('text-muted'),
  },
  unrecognized: {
    padding: '10px 16px',
    gap: '6px',
    borderColor: tokenRef('surface-border'),
    titleFontSize: tokenRef('font-size-sm'),
    titleFontWeight: tokenRef('font-weight-medium'),
    titleColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    titleGap: '4px',
  },
};

/** Type of `listInputTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraListInputTokens = typeof listInputTokens;
