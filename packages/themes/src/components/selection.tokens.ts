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

export const colorPickerTokens = {
  root: {
    gap: '8px',
    swatchSize: '20px',
    swatchBorderRadius: tokenRef('radius-sm'),
    swatchRing: `inset 0 0 0 1px ${tokenRef('surface-border')}`,
  },
  panel: {
    width: '240px',
    padding: '12px',
    gap: '12px',
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
  },
  area: {
    height: '160px',
    borderRadius: tokenRef('radius-md'),
    saturationGradient: 'linear-gradient(to right, rgb(255 255 255), rgb(255 255 255 / 0))',
    brightnessGradient: 'linear-gradient(to top, rgb(0 0 0), rgb(0 0 0 / 0))',
  },
  hue: {
    height: '12px',
    borderRadius: tokenRef('radius-full'),
    gradient:
      'linear-gradient(to right, rgb(255 0 0), rgb(255 255 0), rgb(0 255 0), rgb(0 255 255), rgb(0 0 255), rgb(255 0 255), rgb(255 0 0))',
  },
  handle: {
    size: '16px',
    borderColor: tokenRef('surface-0'),
    ring: `0 0 0 1px ${tokenRef('surface-900')}, ${tokenRef('shadow-overlay')}`,
    focusRing: `0 0 0 2px ${tokenRef('surface-0')}, 0 0 0 4px ${tokenRef('focus-ring-color')}`,
  },
  preset: {
    size: '22px',
    gap: '6px',
    borderRadius: tokenRef('radius-sm'),
    selectedRing: `0 0 0 2px ${tokenRef('surface-overlay')}, 0 0 0 4px ${tokenRef('primary-base')}`,
  },
};

export type TectraColorPickerTokens = typeof colorPickerTokens;

export const mentionTokens = {
  root: {
    panelWidth: '280px',
    optionGap: '8px',
    descriptionColor: tokenRef('text-muted'),
    descriptionFontSize: tokenRef('font-size-sm'),
  },
};

export type TectraMentionTokens = typeof mentionTokens;

export const treeTokens = {
  root: {
    indent: '18px',
    gap: '6px',
    togglerSize: '20px',
    togglerColor: tokenRef('text-muted'),
    togglerHoverBackground: tokenRef('surface-hover'),
    iconColor: tokenRef('text-muted'),
  },
};

export type TectraTreeTokens = typeof treeTokens;

export const cascadeSelectTokens = {
  root: {
    columnWidth: '200px',
    columnBorderColor: tokenRef('surface-overlay-border'),
    groupIconColor: tokenRef('text-muted'),
  },
};

export type TectraCascadeSelectTokens = typeof cascadeSelectTokens;
