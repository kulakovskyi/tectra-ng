import { tokenRef } from './token-helpers';

export const selectTokens = {
  root: {
    dropdownColor: tokenRef('field-icon'),
    gap: '8px',
  },
  overlay: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
  },
  list: {
    padding: '4px',
    gap: '2px',
    maxHeight: '240px',
  },
  option: {
    padding: '8px 12px',
    borderRadius: tokenRef('radius-sm'),
    color: tokenRef('text-primary'),
    focusBackground: tokenRef('list-focus-background'),
    selectedBackground: tokenRef('highlight-background'),
    selectedColor: tokenRef('highlight-color'),
    selectedFocusBackground: tokenRef('highlight-focus-background'),
    selectedFocusColor: tokenRef('highlight-focus-color'),
    disabledColor: tokenRef('form-field-disabled-color'),
    checkColor: tokenRef('primary-base'),
  },
  optionGroup: {
    padding: '8px 12px 4px',
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-sm'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  filter: {
    padding: '8px 12px',
    borderColor: tokenRef('surface-overlay-border'),
  },
  header: {
    padding: '8px 12px',
    borderColor: tokenRef('surface-overlay-border'),
  },
  footer: {
    padding: '8px 12px',
    borderColor: tokenRef('surface-overlay-border'),
  },
  empty: {
    padding: '12px',
    color: tokenRef('text-muted'),
  },
};

export type TectraSelectTokens = typeof selectTokens;
