import { TectraComponentTokens } from '../../components/component-tokens';
import { fade, joinCss, lightDark, mergeTokens, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

/* @__NO_SIDE_EFFECTS__ */
const steps = (palette: string, light: number, dark: number) => lightDark(tokenRef(`${palette}-${light}`), tokenRef(`${palette}-${dark}`));
const elevation = '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)';
const noFocusRing = { focusRingColor: 'transparent', focusRingWidth: '0', focusRingOffset: '0' };

export const paperControlsTokens: TectraDeepPartial<TectraComponentTokens> = {
  button: {
    root: {
      borderRadius: tokenRef('radius-sm'),
      roundedBorderRadius: '24.5px',
      paddingX: '12.25px',
      paddingY: '10.75px',
      iconOnlyWidth: '40.5px',
      sm: { paddingY: '8px', iconOnlyWidth: '34px' },
      lg: { paddingY: '12.25px', iconOnlyWidth: '46.5px' },
      focusRing: { width: '0', style: 'none', offset: '0' },
      badgeSize: '12.25px',
    },
    outlined: {
      primary: { borderColor: lightDark(tokenRef('primary-base'), tokenRef('primary-700')) },
      secondary: { borderColor: steps('surface', 600, 700), color: steps('surface', 600, 400) },
      success: { borderColor: steps('green', 500, 700) },
      info: { borderColor: steps('sky', 500, 700) },
      warn: { borderColor: steps('orange', 500, 700) },
      help: { borderColor: steps('purple', 500, 700) },
      danger: { borderColor: steps('red', 500, 700) },
      contrast: { borderColor: steps('surface', 950, 500) },
      plain: { borderColor: steps('surface', 900, 600), color: steps('surface', 900, 0) },
    },
    text: {
      secondary: { color: steps('surface', 600, 400) },
      plain: { color: steps('surface', 900, 0) },
    },
  },
  toggleButton: {
    root: {
      padding: '8.75px 12.25px',
      borderRadius: tokenRef('radius-sm'),
      background: tokenRef('form-field-background'),
      checkedBackground: steps('surface', 200, 700),
      hoverBackground: steps('surface', 100, 800),
      borderColor: tokenRef('form-field-border-color'),
      checkedBorderColor: tokenRef('form-field-border-color'),
      color: tokenRef('form-field-color'),
      hoverColor: tokenRef('form-field-color'),
      focusRing: { width: '0', style: 'none', color: 'transparent', offset: '0' },
      sm: { padding: '7px 8.75px' },
      lg: { padding: '10.5px 15.75px' },
    },
    icon: {
      color: tokenRef('text-muted'),
      hoverColor: tokenRef('text-muted'),
      checkedColor: tokenRef('text-muted'),
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
    root: mergeTokens({ borderRadius: tokenRef('radius-xs'), borderWidth: '2px', checkedHoverBackground: tokenRef('primary-base'), checkedHoverBorderColor: tokenRef('primary-base') }, noFocusRing),
    sm: { size: '14px' },
  },
  radioButton: {
    root: mergeTokens({ size: '20px', borderWidth: '2px', checkedBackground: tokenRef('primary-contrast'), checkedHoverBackground: tokenRef('primary-contrast'), checkedHoverBorderColor: tokenRef('primary-base'), dotSize: '10px', dotColor: tokenRef('primary-base') }, noFocusRing),
    sm: { dotSize: '8px' },
    lg: { size: '24px', dotSize: '12px' },
  },
  toggleSwitch: {
    root: mergeTokens({ width: '33.25px', height: '12.25px', gutter: '0px', hoverBackground: steps('surface', 300, 700), checkedBackground: lightDark(tokenRef('primary-200'), tokenRef('primary-base')), checkedHoverBackground: lightDark(tokenRef('primary-200'), tokenRef('primary-base')), disabledBackground: steps('surface', 400, 600) }, noFocusRing),
    handle: {
      size: '17.5px',
      checkedBackground: lightDark(tokenRef('primary-base'), tokenRef('primary-200')),
      disabledBackground: steps('surface', 200, 500),
      shadow: elevation,
      iconColor: lightDark(tokenRef('text-muted'), tokenRef('surface-800')),
      checkedIconColor: tokenRef('primary-contrast'),
    },
  },
  rating: {
    root: { gap: '7px', iconSize: '15.75px' },
  },
  knob: {
    root: { focusRingColor: steps('surface', 200, 700), focusRingWidth: '4px', focusRingOffset: '0' },
  },
  slider: {
    root: { trackSize: '2px', trackBorderRadius: tokenRef('radius-xs') },
    handle: mergeTokens({ background: tokenRef('primary-base'), borderWidth: '0px', shadow: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)', hoverRing: joinCss('0 0 1px 10px ', fade(tokenRef('primary-base'), '92%')) }, noFocusRing),
  },
  filtersPanel: { button: { borderRadius: tokenRef('radius-sm') } },
};
