import { lightDark, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-radio-button`: colors, sizes and spacing of its root, tile and group, plus the `sm`
 * and `lg` sizes.
 */
export const radioButtonTokens = {
  root: {
    size: '18px',
    borderWidth: '1.5px',
    borderColor: tokenRef('form-field-border-color'),
    hoverBorderColor: tokenRef('form-field-hover-border-color'),
    background: tokenRef('form-field-background'),
    filledBackground: tokenRef('form-field-filled-background'),
    checkedBorderColor: tokenRef('primary-base'),
    checkedBackground: tokenRef('primary-base'),
    checkedHoverBorderColor: tokenRef('primary-hover'),
    checkedHoverBackground: tokenRef('primary-hover'),
    dotSize: '8px',
    dotColor: tokenRef('primary-contrast'),
    invalidBorderColor: tokenRef('form-field-invalid-border-color'),
    disabledBackground: tokenRef('form-field-disabled-background'),
    disabledBorderColor: tokenRef('form-field-border-color'),
    disabledCheckedBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    disabledDotColor: lightDark(tokenRef('surface-0'), tokenRef('surface-900')),
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingWidth: '2px',
    focusRingOffset: '2px',
    gap: '8px',
    labelColor: tokenRef('text-primary'),
    labelFontSize: tokenRef('font-size-md'),
    labelFontWeight: tokenRef('font-weight-regular'),
    disabledLabelColor: tokenRef('text-muted'),
    descriptionColor: tokenRef('text-muted'),
    descriptionFontSize: tokenRef('font-size-sm'),
    transitionDuration: tokenRef('motion-duration'),
  },
  sm: { size: '16px', dotSize: '6px', labelFontSize: tokenRef('font-size-sm') },
  lg: { size: '22px', dotSize: '10px', labelFontSize: tokenRef('font-size-lg') },
  tile: {
    padding: '12px 14px',
    gap: '12px',
    borderRadius: tokenRef('radius-lg'),
    borderColor: tokenRef('surface-border'),
    hoverBorderColor: tokenRef('form-field-hover-border-color'),
    background: tokenRef('surface-card'),
    checkedBorderColor: tokenRef('primary-base'),
    checkedBackground: tokenRef('highlight-background'),
    labelFontWeight: tokenRef('font-weight-medium'),
  },
  group: { gap: '10px', horizontalGap: '20px' },
};

type RadioButtonTokensShape = typeof radioButtonTokens;

/** Type of `radioButtonTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraRadioButtonTokens extends RadioButtonTokensShape {}
