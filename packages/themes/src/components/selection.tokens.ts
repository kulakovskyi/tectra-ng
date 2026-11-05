import { tokenRef } from './token-helpers';

export const listboxTokens = {
  root: {
    background: tokenRef('form-field-background'),
    borderColor: tokenRef('form-field-border-color'),
    borderRadius: tokenRef('form-field-border-radius'),
    shadow: tokenRef('form-field-shadow'),
    focusBorderColor: tokenRef('form-field-focus-border-color'),
    focusRingShadow: tokenRef('form-field-focus-ring-shadow'),
    invalidBorderColor: tokenRef('form-field-invalid-border-color'),
    disabledBackground: tokenRef('form-field-disabled-background'),
    disabledColor: tokenRef('form-field-disabled-color'),
  },
};

export type TectraListboxTokens = typeof listboxTokens;

export const chipsInputTokens = {
  root: {
    gap: '4px',
    chipHeight: '24px',
    chipFontSize: tokenRef('font-size-sm'),
    chipPaddingX: '8px',
    chipBorderRadius: tokenRef('radius-sm'),
    inputMinWidth: '80px',
  },
};

export type TectraChipsInputTokens = typeof chipsInputTokens;

export const countryTokens = {
  root: {
    gap: '8px',
    smallSize: '16px',
    mediumSize: '20px',
    largeSize: '24px',
    borderRadius: '2px',
    ring: `0 0 0 1px ${tokenRef('surface-border')}`,
    nameColor: 'inherit',
    hintColor: tokenRef('text-muted'),
    countColor: tokenRef('text-muted'),
    countFontSize: tokenRef('font-size-sm'),
  },
};

export type TectraCountryTokens = typeof countryTokens;
