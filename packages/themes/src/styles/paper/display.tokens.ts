import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

function solid(severity: string) {
  return { background: tokenRef(`${severity}-base`), color: tokenRef(`${severity}-contrast`) };
}

export const paperDisplayTokens: TectraDeepPartial<TectraComponentTokens> = {
  badge: {
    root: { padding: '0 7px' },
  },
  tag: {
    root: { paddingY: '3.5px', tint: '100%' },
    primary: solid('primary'),
    secondary: {
      background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
      color: lightDark(tokenRef('surface-600'), tokenRef('surface-300')),
    },
    success: solid('success'),
    info: solid('info'),
    warn: solid('warn'),
    danger: solid('danger'),
    help: solid('help'),
    contrast: solid('contrast'),
  },
  pill: {
    root: { paddingX: '7px', paddingY: '3.5px' },
  },
  chip: {
    root: {
      height: '36.75px',
      gap: '7px',
      background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      imageSize: '28px',
      iconColor: lightDark(tokenRef('surface-600'), tokenRef('surface-0')),
      removeColor: lightDark(tokenRef('surface-600'), tokenRef('surface-0')),
      focusRingWidth: '0',
      focusRingOffset: '0',
      focusRingShadow: `0 0 1px 4px ${lightDark(tokenRef('surface-300'), tokenRef('surface-600'))}`,
    },
  },
  message: {
    root: { borderRadius: tokenRef('radius-sm'), borderWidth: '0', paddingY: '12.25px', paddingStart: '15.75px', paddingEnd: '15.75px' },
    icon: { fontSize: '15.75px' },
    closeButton: { size: '24.5px' },
    sm: { paddingY: '7px', paddingStart: '7px', paddingEnd: '7px' },
    lg: { paddingY: '10.5px', paddingStart: '10.5px', paddingEnd: '10.5px', iconFontSize: '17.5px' },
  },
  progressBar: {
    root: { borderRadius: tokenRef('radius-sm'), trackBackground: tokenRef('surface-border') },
  },
  skeleton: {
    root: { borderRadius: tokenRef('radius-sm') },
  },
  avatar: {
    root: { squareBorderRadius: tokenRef('radius-sm'), background: tokenRef('surface-border'), color: tokenRef('text-primary') },
  },
  divider: {
    root: { contentColor: tokenRef('text-primary'), contentGap: '7px' },
  },
  card: {
    root: {
      borderRadius: tokenRef('radius-sm'),
      shadow: '0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12)',
      padding: '17.5px',
      gap: '8.75px',
      subtitleFontSize: '12.25px',
    },
  },
  panel: {
    root: { borderRadius: tokenRef('radius-sm'), padding: '15.75px' },
  },
  fieldset: {
    root: {
      borderRadius: tokenRef('radius-sm'),
      padding: '0 15.75px 15.75px 15.75px',
      legendBorderRadius: tokenRef('radius-sm'),
      legendPadding: '8.75px 12.25px',
      togglePadding: '8.75px 12.25px',
      legendFocusBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      focusRingWidth: '0',
      focusRingOffset: '0',
    },
  },
  tabs: {
    badge: { solidActiveBackground: lightDark(tokenRef('primary-800'), tokenRef('primary-active')) },
  },
  editor: {
    ai: { color: lightDark(tokenRef('primary-700'), tokenRef('primary-hover')) },
  },
};
