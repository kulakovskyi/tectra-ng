import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const invalidColor = lightDark(tokenRef('red-800'), tokenRef('red-300'));
const dropdownShadow = '0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)';
const popoverShadow = '0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)';

export const paperFormsTokens: TectraDeepPartial<TectraComponentTokens> = {
  formField: {
    root: {
      filledBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
      filledHoverBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      filledFocusBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
      invalidBorderColor: invalidColor,
      placeholderColor: tokenRef('field-placeholder'),
      invalidPlaceholderColor: invalidColor,
      iconColor: tokenRef('field-icon'),
      shadow: 'none',
      borderRadius: tokenRef('radius-sm'),
      paddingY: '8.75px',
      sm: { paddingY: '7px' },
      lg: { paddingY: '10.5px' },
      focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '-2px' },
    },
  },
  inputGroup: {
    addon: { color: tokenRef('form-field-icon-color'), paddingX: '8.75px', minWidth: '36.75px' },
  },
  label: {
    root: { gap: '7px' },
  },
  floatLabel: {
    root: { invalidColor, fontWeight: tokenRef('font-weight-medium') },
    in: { input: { paddingTop: '17.5px', paddingBottom: '7px' }, active: { top: '7px' } },
  },
  iftaLabel: {
    root: { invalidColor, top: '7px', fontWeight: tokenRef('font-weight-regular') },
    input: { paddingTop: '17.5px', paddingBottom: '7px' },
  },
  password: {
    panel: { padding: '12.25px', borderRadius: tokenRef('radius-sm'), shadow: popoverShadow },
    meter: { borderRadius: tokenRef('radius-sm'), background: lightDark(tokenRef('surface-300'), tokenRef('surface-700')) },
  },
  inputOtp: {
    root: { cellWidth: '36.75px' },
    sm: { cellWidth: '31.5px' },
    lg: { cellWidth: '42px' },
  },
  inputNumber: {
    button: { width: '36.75px' },
  },
  select: {
    overlay: { borderRadius: tokenRef('radius-sm'), shadow: dropdownShadow },
    list: { paddingBlock: '7px', paddingInline: '0px', gap: '0px' },
    option: {
      padding: '8.75px 12.25px',
      borderRadius: '0',
      checkColor: tokenRef('text-primary'),
      multiple: {
        selectedBackground: tokenRef('highlight-background'),
        selectedFocusBackground: tokenRef('highlight-focus-background'),
        selectedColor: tokenRef('highlight-color'),
        selectedFocusColor: tokenRef('highlight-focus-color'),
      },
    },
    optionGroup: { padding: '8.75px 12.25px', color: tokenRef('text-primary'), fontWeight: tokenRef('font-weight-bold') },
    filter: { padding: '8.75px 12.25px' },
    header: { padding: '8.75px 12.25px' },
    empty: { padding: '8.75px 12.25px' },
    dropdownButton: { width: '36.75px' },
  },
  colorPicker: {
    root: { swatchSize: '24.5px' },
    panel: { borderRadius: tokenRef('radius-sm'), shadow: popoverShadow },
  },
};
