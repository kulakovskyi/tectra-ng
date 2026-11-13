import { lightDark, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-select`, `tx-multiselect` and `tx-autocomplete`: colors, sizes and spacing of its
 * root, overlay, list, option, checkbox and other parts.
 */
export const selectTokens = {
  root: {
    dropdownColor: tokenRef('form-field-icon-color'),
    dropdownWidth: '31.5px',
    clearSize: '14px',
    gap: '0px',
  },
  overlay: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
  },
  list: {
    padding: '3.5px',
    paddingBlock: tokenRef('select-list-padding'),
    paddingInline: tokenRef('select-list-padding'),
    gap: '2px',
    maxHeight: '200px',
  },
  option: {
    padding: '7px 10.5px',
    gap: '7px',
    borderRadius: tokenRef('radius-sm'),
    color: tokenRef('text-primary'),
    focusColor: tokenRef('select-option-color'),
    focusBackground: tokenRef('list-focus-background'),
    selectedBackground: tokenRef('highlight-background'),
    selectedColor: tokenRef('highlight-color'),
    selectedFocusBackground: tokenRef('highlight-focus-background'),
    selectedFocusColor: tokenRef('highlight-focus-color'),
    selectedFontWeight: tokenRef('font-weight-regular'),
    disabledColor: tokenRef('form-field-disabled-color'),
    checkColor: tokenRef('primary-base'),
    multiple: {
      selectedBackground: 'transparent',
      selectedFocusBackground: tokenRef('select-option-focus-background'),
      selectedColor: tokenRef('select-option-color'),
      selectedFocusColor: tokenRef('select-option-focus-color'),
    },
  },
  checkbox: {
    size: '15.75px',
    borderRadius: tokenRef('radius-sm'),
    borderColor: tokenRef('form-field-border-color'),
    background: tokenRef('form-field-background'),
    checkedBackground: tokenRef('primary-base'),
    checkedColor: tokenRef('primary-contrast'),
    iconSize: '10.5px',
    shadow: tokenRef('shadow-field'),
  },
  chip: {
    gap: '5.25px',
    paddingY: '3.5px',
    paddingStart: '8.75px',
    paddingEnd: '5.25px',
    borderRadius: tokenRef('radius-sm'),
    background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    color: lightDark(tokenRef('surface-800'), tokenRef('surface-0')),
    fontSize: '10.5px',
    removeSize: '12.25px',
    removeColor: lightDark(tokenRef('surface-800'), tokenRef('surface-0')),
    removeHoverColor: tokenRef('text-primary'),
  },
  optionGroup: {
    padding: '3.5px 8.75px',
    color: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  filter: {
    padding: '7px 12.25px 1.75px',
    gap: '7px',
    iconInset: '10.5px',
    minHeight: '37px',
  },
  dropdownButton: {
    width: tokenRef('select-dropdown-width'),
    background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    hoverBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    activeBackground: tokenRef('select-dropdown-button-hover-background'),
    color: lightDark(tokenRef('surface-600'), tokenRef('surface-300')),
    hoverColor: lightDark(tokenRef('surface-700'), tokenRef('surface-200')),
  },
  header: {
    padding: '7px 12.25px 1.75px',
  },
  footer: {
    padding: '1.75px 12.25px 7px',
  },
  empty: {
    padding: '7px 10.5px',
    color: tokenRef('text-primary'),
  },
};

type SelectTokensShape = typeof selectTokens;

/** Type of `selectTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraSelectTokens extends SelectTokensShape {}
