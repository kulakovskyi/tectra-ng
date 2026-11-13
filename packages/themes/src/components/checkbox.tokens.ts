import { lightDark, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-checkbox`: colors, sizes and spacing of its root, tile and group, plus the `sm` and
 * `lg` sizes.
 */
export const checkboxTokens = {
  root: {
    size: '18px',
    borderRadius: tokenRef('radius-sm'),
    borderWidth: '1.5px',
    borderColor: tokenRef('form-field-border-color'),
    hoverBorderColor: tokenRef('form-field-hover-border-color'),
    background: tokenRef('form-field-background'),
    filledBackground: tokenRef('form-field-filled-background'),
    checkedBackground: tokenRef('primary-base'),
    checkedBorderColor: tokenRef('primary-base'),
    checkedHoverBackground: tokenRef('primary-hover'),
    checkedHoverBorderColor: tokenRef('primary-hover'),
    iconColor: tokenRef('primary-contrast'),
    iconSize: '12px',
    invalidBorderColor: tokenRef('form-field-invalid-border-color'),
    disabledBackground: tokenRef('form-field-disabled-background'),
    disabledBorderColor: tokenRef('form-field-border-color'),
    disabledCheckedBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    disabledIconColor: lightDark(tokenRef('surface-0'), tokenRef('surface-900')),
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
  sm: { size: '16px', iconSize: '10px', labelFontSize: tokenRef('font-size-sm') },
  lg: { size: '22px', iconSize: '14px', labelFontSize: tokenRef('font-size-lg') },
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
  group: { gap: '10px', horizontalGap: '20px', selectAllGap: '12px' },
};

type CheckboxTokensShape = typeof checkboxTokens;

/** Type of `checkboxTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCheckboxTokens extends CheckboxTokensShape {}
