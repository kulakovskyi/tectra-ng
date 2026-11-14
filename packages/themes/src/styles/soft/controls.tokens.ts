import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, mergeTokens, mix, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';
import { softFillHover, softFocusShadow, softGlow, softLine } from './soft.shared';

/* @__NO_SIDE_EFFECTS__ */
const focus = (color: string) => ({ focusRing: { color: 'transparent', shadow: softFocusShadow(color) } });
/* @__NO_SIDE_EFFECTS__ */
const tonal = (amount: string) => mix(tokenRef('primary-base'), amount, tokenRef('surface-card'));
const glowRing = { focusRingColor: softGlow('primary-base'), focusRingWidth: '3px', focusRingOffset: '0' };

export const softControlsTokens: TectraDeepPartial<TectraComponentTokens> = {
  button: {
    root: {
      borderRadius: '22px',
      paddingX: '16px',
      sm: { paddingX: '12px' },
      lg: { paddingX: '20px' },
      focusRing: { width: '0', style: 'none', offset: '0' },
      primary: focus('primary-base'),
      secondary: mergeTokens({ background: tonal('12%'), hoverBackground: tonal('18%'), activeBackground: tonal('26%'), borderColor: tonal('12%'), hoverBorderColor: tonal('18%'), activeBorderColor: tonal('26%'), color: tokenRef('primary-soft-text'), hoverColor: tokenRef('primary-soft-text'), activeColor: tokenRef('primary-soft-text') }, focus('primary-base')),
      info: focus('info-base'),
      success: focus('success-base'),
      warn: focus('warn-base'),
      help: focus('help-base'),
      danger: focus('danger-base'),
      contrast: focus('contrast-base'),
    },
  },
  toggleButton: {
    root: {
      borderRadius: tokenRef('radius-full'),
      borderColor: 'transparent',
      checkedBorderColor: 'transparent',
      focusRing: { width: '3px', color: softGlow('primary-base'), offset: '0' },
    },
    content: { borderRadius: tokenRef('radius-full') },
  },
  checkbox: {
    root: mergeTokens({ borderRadius: '6px', borderColor: softLine, hoverBorderColor: tokenRef('primary-base'), disabledBorderColor: softLine }, glowRing),
  },
  radioButton: {
    root: mergeTokens({ borderColor: softLine, hoverBorderColor: tokenRef('primary-base'), disabledBorderColor: softLine }, glowRing),
    tile: { borderRadius: tokenRef('radius-xl'), borderColor: 'transparent', background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')) },
  },
  toggleSwitch: {
    root: mergeTokens({ background: softFillHover }, glowRing),
  },
  rating: { root: glowRing },
  knob: { root: glowRing },
  slider: { handle: glowRing },
  filtersPanel: { button: { borderRadius: '22px' } },
  commandPalette: { trigger: { borderRadius: tokenRef('radius-xl') } },
};
