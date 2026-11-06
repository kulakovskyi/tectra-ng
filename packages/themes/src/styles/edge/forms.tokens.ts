import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const filledBackground = lightDark(tokenRef('surface-100'), tokenRef('surface-800'));

export const edgeFormsTokens: TectraDeepPartial<TectraComponentTokens> = {
  formField: {
    root: {
      filledBackground,
      filledHoverBackground: filledBackground,
      filledFocusBackground: filledBackground,
      focusBorderColor: tokenRef('field-border'),
      invalidBorderColor: lightDark(tokenRef('red-500'), tokenRef('red-400')),
      placeholderColor: tokenRef('field-placeholder'),
      iconColor: tokenRef('field-icon'),
      shadow: 'none',
      borderRadius: tokenRef('radius-xs'),
      focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '-1px' },
    },
  },
  inputGroup: {
    addon: { color: tokenRef('form-field-icon-color'), paddingX: '7px', minWidth: '35px' },
  },
  floatLabel: {
    root: { fontWeight: tokenRef('font-weight-medium') },
    over: { active: { top: '-17.5px' } },
  },
  iftaLabel: {
    root: { fontWeight: tokenRef('font-weight-regular') },
  },
  password: {
    panel: { borderRadius: tokenRef('radius-xs') },
    meter: {
      borderRadius: tokenRef('radius-xs'),
      background: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
      weakBackground: lightDark(tokenRef('red-600'), tokenRef('red-500')),
      mediumBackground: lightDark(tokenRef('yellow-600'), tokenRef('yellow-500')),
      strongBackground: lightDark(tokenRef('green-600'), tokenRef('green-500')),
    },
  },
  inputNumber: {
    button: {
      width: '35px',
      hoverBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      activeBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
      color: tokenRef('form-field-icon-color'),
      hoverColor: tokenRef('form-field-icon-color'),
      activeColor: tokenRef('form-field-icon-color'),
    },
  },
  select: {
    overlay: { borderRadius: tokenRef('radius-xs') },
    list: { paddingBlock: '1.75px', paddingInline: '0px', gap: '0px' },
    option: {
      borderRadius: '0',
      focusColor: tokenRef('text-hover'),
      checkColor: tokenRef('highlight-color'),
      multiple: {
        selectedBackground: tokenRef('highlight-background'),
        selectedFocusBackground: tokenRef('highlight-focus-background'),
        selectedColor: tokenRef('highlight-color'),
        selectedFocusColor: tokenRef('highlight-focus-color'),
      },
    },
    optionGroup: { color: tokenRef('text-primary'), fontWeight: tokenRef('font-weight-bold') },
    chip: { borderRadius: tokenRef('radius-xs') },
    filter: { padding: '7px 7px 1.75px' },
    header: { padding: '7px 7px 1.75px' },
    dropdownButton: {
      background: tokenRef('form-field-background'),
      color: tokenRef('form-field-icon-color'),
      hoverColor: tokenRef('form-field-icon-color'),
    },
  },
  chipsInput: {
    root: { chipBorderRadius: tokenRef('radius-xs') },
  },
  colorPicker: {
    root: { swatchBorderRadius: tokenRef('radius-xs') },
    panel: { borderRadius: tokenRef('radius-xs') },
  },
};
