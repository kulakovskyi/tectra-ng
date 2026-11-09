import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';
import { softFill, softFillHover, softFocusShadow, softLine } from './soft.shared';

export const softFormsTokens: TectraDeepPartial<TectraComponentTokens> = {
  formField: {
    root: {
      background: softFill,
      filledBackground: softFill,
      filledHoverBackground: softFillHover,
      filledFocusBackground: lightDark(tokenRef('surface-0'), tokenRef('surface-900')),
      placeholderColor: lightDark(tokenRef('surface-600'), tokenRef('surface-400')),
      iconColor: lightDark(tokenRef('surface-600'), tokenRef('surface-400')),
      borderColor: softFill,
      hoverBorderColor: softLine,
      shadow: 'none',
      borderRadius: tokenRef('radius-xl'),
      paddingX: '14px',
      sm: { paddingX: '12px' },
      lg: { paddingX: '16px' },
      focusRing: { shadow: softFocusShadow() },
      invalidFocusRing: { shadow: softFocusShadow('danger-base') },
    },
  },
  inputGroup: {
    addon: { background: lightDark(tokenRef('surface-200'), tokenRef('surface-800')), borderColor: softFill },
  },
  select: {
    overlay: { borderRadius: tokenRef('radius-xl') },
    list: { padding: '6px', gap: '2px' },
    option: { padding: '8px 12px', borderRadius: tokenRef('radius-lg') },
    chip: { borderRadius: tokenRef('radius-full') },
    checkbox: { borderRadius: '6px', borderColor: softLine },
    optionGroup: { color: tokenRef('text-muted') },
  },
  listbox: {
    root: { focusRingShadow: softFocusShadow() },
  },
  chipsInput: {
    root: { chipBorderRadius: tokenRef('radius-full') },
  },
  password: {
    panel: { borderRadius: tokenRef('radius-xl') },
  },
};
