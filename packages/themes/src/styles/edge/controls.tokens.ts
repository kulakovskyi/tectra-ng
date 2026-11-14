import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

/* @__NO_SIDE_EFFECTS__ */
const steps = (palette: string, light: number, dark: number) => lightDark(tokenRef(`${palette}-${light}`), tokenRef(`${palette}-${dark}`));

/* @__NO_SIDE_EFFECTS__ */
const outlined = (palette: string) => ({
  hoverBackground: steps(palette, 50, 950),
  activeBackground: steps(palette, 100, 900),
  borderColor: steps(palette, 600, 500),
});

/* @__NO_SIDE_EFFECTS__ */
const outlinedWithColor = (palette: string) => ({ ...outlined(palette), color: steps(palette, 600, 500) });

export const edgeControlsTokens: TectraDeepPartial<TectraComponentTokens> = {
  button: {
    root: {
      borderRadius: tokenRef('radius-xs'),
      label: { fontWeight: tokenRef('font-weight-bold') },
      secondary: {
        background: steps('surface', 200, 700),
        hoverBackground: steps('surface', 300, 600),
        activeBackground: steps('surface', 400, 500),
        borderColor: steps('surface', 200, 700),
        hoverBorderColor: steps('surface', 300, 600),
        activeBorderColor: steps('surface', 400, 500),
        color: steps('surface', 700, 200),
        hoverColor: steps('surface', 800, 100),
        activeColor: steps('surface', 900, 0),
        focusRing: { color: steps('surface', 700, 200) },
      },
    },
    outlined: {
      primary: { borderColor: tokenRef('primary-base') },
      secondary: { borderColor: steps('surface', 600, 400), color: steps('surface', 600, 400) },
      success: outlinedWithColor('green'),
      info: outlined('sky'),
      warn: outlined('orange'),
      help: outlinedWithColor('purple'),
      danger: outlinedWithColor('red'),
      contrast: { borderColor: steps('surface', 950, 0) },
      plain: { borderColor: steps('surface', 900, 0), color: steps('surface', 900, 0) },
    },
    text: {
      secondary: { color: steps('surface', 600, 400) },
      success: { color: steps('green', 600, 500) },
      help: { color: steps('purple', 600, 500) },
      danger: { color: steps('red', 600, 500) },
      plain: { color: steps('surface', 900, 0) },
    },
  },
  toggleButton: {
    root: {
      borderRadius: tokenRef('radius-xs'),
      background: tokenRef('form-field-background'),
      checkedBackground: tokenRef('highlight-background'),
      hoverBackground: steps('surface', 200, 700),
      borderColor: tokenRef('form-field-border-color'),
      checkedBorderColor: tokenRef('form-field-border-color'),
      color: tokenRef('form-field-color'),
      hoverColor: tokenRef('form-field-color'),
      checkedColor: tokenRef('highlight-color'),
      focusRing: { offset: '-1px' },
    },
    icon: {
      color: tokenRef('text-muted'),
      hoverColor: tokenRef('text-muted'),
      checkedColor: tokenRef('highlight-color'),
    },
    content: {
      padding: '0',
      borderRadius: '0',
      checkedBackground: 'transparent',
      checkedShadow: 'none',
      sm: { padding: '0' },
      lg: { padding: '0' },
    },
  },
  checkbox: {
    root: { borderRadius: tokenRef('radius-xs') },
    tile: { checkedBackground: tokenRef('primary-soft') },
  },
  radioButton: {
    root: {
      checkedBackground: tokenRef('form-field-background'),
      checkedHoverBackground: tokenRef('form-field-background'),
      checkedBorderColor: tokenRef('form-field-border-color'),
      checkedHoverBorderColor: tokenRef('form-field-hover-border-color'),
      dotColor: tokenRef('primary-base'),
    },
    tile: { checkedBackground: tokenRef('primary-soft') },
  },
  toggleSwitch: {
    root: {
      borderWidth: '1px',
      borderColor: tokenRef('form-field-border-color'),
      hoverBorderColor: tokenRef('form-field-border-color'),
      checkedBorderColor: tokenRef('primary-base'),
      checkedHoverBorderColor: tokenRef('primary-base'),
      background: tokenRef('form-field-background'),
      hoverBackground: tokenRef('form-field-background'),
      checkedHoverBackground: tokenRef('primary-base'),
      disabledBackground: tokenRef('form-field-disabled-background'),
      transitionDuration: '0.1s',
    },
    handle: {
      background: tokenRef('form-field-border-color'),
      checkedBackground: tokenRef('primary-contrast'),
      disabledBackground: tokenRef('form-field-disabled-color'),
      iconColor: tokenRef('surface-0'),
    },
  },
  rating: {
    root: { activeColor: tokenRef('text-primary'), hoverColor: tokenRef('text-primary') },
  },
  knob: {
    root: { rangeColor: steps('surface', 300, 600) },
  },
  slider: {
    root: { trackBackground: steps('surface', 300, 600), trackBorderRadius: tokenRef('radius-xs') },
    handle: { size: '16px', background: tokenRef('primary-base'), shadow: 'none' },
  },
  filtersPanel: { button: { borderRadius: tokenRef('radius-xs') } },
  commandPalette: { trigger: { borderRadius: tokenRef('radius-xs') } },
};
