import { joinCss, tokenRef } from './token-helpers';

/** Design tokens of `tx-listbox`: its colors, sizes and spacing. */
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

type ListboxTokensShape = typeof listboxTokens;

/** Type of `listboxTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraListboxTokens extends ListboxTokensShape {}

/** Design tokens of `tx-chips-input`: its colors, sizes and spacing. */
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

type ChipsInputTokensShape = typeof chipsInputTokens;

/** Type of `chipsInputTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraChipsInputTokens extends ChipsInputTokensShape {}

/** Design tokens of `tx-country`: its colors, sizes and spacing. */
export const countryTokens = {
  root: {
    gap: '7px',
    smallSize: '1em',
    mediumSize: '17.5px',
    largeSize: '28px',
    borderRadius: tokenRef('radius-xs'),
    ring: joinCss('0 0 0 1px ', tokenRef('surface-border')),
    ringGutter: '1px',
    loadingBackground: tokenRef('surface-hover'),
    nameColor: 'inherit',
    hintColor: tokenRef('text-muted'),
    countColor: tokenRef('text-muted'),
    countFontSize: tokenRef('font-size-sm'),
  },
};

type CountryTokensShape = typeof countryTokens;

/** Type of `countryTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCountryTokens extends CountryTokensShape {}

/**
 * Design tokens of `tx-color-picker`: colors, sizes and spacing of its root, dot, panel, area, hue and other
 * parts.
 */
export const colorPickerTokens = {
  root: {
    gap: '8px',
    swatchSize: '20px',
    swatchBorderRadius: tokenRef('radius-sm'),
    swatchRing: joinCss('inset 0 0 0 1px ', tokenRef('surface-border')),
  },
  dot: {
    size: tokenRef('form-field-font-size'),
    ringColor: joinCss('color-mix(in srgb, ', tokenRef('text-primary'), ' 30%, transparent)'),
    emptyBorderColor: tokenRef('text-muted'),
    focusRingColor: tokenRef('focus-ring-color'),
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
    ring: joinCss('0 0 0 1px ', tokenRef('surface-900'), ', ', tokenRef('shadow-overlay')),
    focusRing: joinCss('0 0 0 2px ', tokenRef('surface-0'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
  },
  preset: {
    size: '22px',
    gap: '6px',
    borderRadius: tokenRef('radius-sm'),
    selectedRing: joinCss('0 0 0 2px ', tokenRef('surface-overlay'), ', 0 0 0 4px ', tokenRef('primary-base')),
  },
};

type ColorPickerTokensShape = typeof colorPickerTokens;

/** Type of `colorPickerTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraColorPickerTokens extends ColorPickerTokensShape {}

/** Design tokens of `tx-mention-textarea`: its colors, sizes and spacing. */
export const mentionTokens = {
  root: {
    panelWidth: '280px',
    optionGap: '8px',
    descriptionColor: tokenRef('text-muted'),
    descriptionFontSize: tokenRef('font-size-sm'),
  },
};

type MentionTokensShape = typeof mentionTokens;

/** Type of `mentionTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraMentionTokens extends MentionTokensShape {}

/** Design tokens of `tx-cascade-select`: its colors, sizes and spacing. */
export const cascadeSelectTokens = {
  root: {
    columnWidth: '200px',
    columnBorderColor: tokenRef('surface-overlay-border'),
    groupIconColor: tokenRef('text-muted'),
  },
};

type CascadeSelectTokensShape = typeof cascadeSelectTokens;

/** Type of `cascadeSelectTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCascadeSelectTokens extends CascadeSelectTokensShape {}

/** Design tokens of `tx-email-suggestion`: its colors, sizes and spacing. */
export const emailSuggestionTokens = {
  root: {
    offset: '6px',
    enterDistance: '6px',
    enterDuration: '320ms',
  },
};

type EmailSuggestionTokensShape = typeof emailSuggestionTokens;

/** Type of `emailSuggestionTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraEmailSuggestionTokens extends EmailSuggestionTokensShape {}
