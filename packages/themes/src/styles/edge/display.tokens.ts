import { TectraComponentTokens } from '../../components/component-tokens';
import { fade, lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

/* @__NO_SIDE_EFFECTS__ */
function solid(severity: string) {
  return { background: tokenRef(`${severity}-base`), color: tokenRef(`${severity}-contrast`) };
}

export const edgeDisplayTokens: TectraDeepPartial<TectraComponentTokens> = {
  tag: {
    root: { borderRadius: tokenRef('radius-xs'), tint: '100%' },
    primary: solid('primary'),
    secondary: {
      background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      color: lightDark(tokenRef('surface-700'), tokenRef('surface-200')),
    },
    success: solid('success'),
    info: solid('info'),
    warn: solid('warn'),
    danger: solid('danger'),
    help: solid('help'),
    contrast: solid('contrast'),
  },
  chip: {
    root: {
      background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      iconColor: tokenRef('text-primary'),
      removeColor: tokenRef('text-primary'),
    },
  },
  message: {
    root: { borderRadius: tokenRef('radius-xs'), fontSize: '14px', fontWeight: tokenRef('font-weight-bold') },
    info: { text: lightDark(tokenRef('sky-800'), tokenRef('sky-200')) },
    success: { text: lightDark(tokenRef('green-800'), tokenRef('green-200')) },
    danger: { text: lightDark(tokenRef('red-800'), tokenRef('red-200')) },
  },
  progressBar: {
    root: {
      borderRadius: tokenRef('radius-xs'),
      trackBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
      labelFontWeight: tokenRef('font-weight-bold'),
    },
  },
  skeleton: {
    root: {
      borderRadius: tokenRef('radius-xs'),
      background: lightDark(tokenRef('surface-300'), fade(tokenRef('surface-0'), '90%')),
    },
  },
  avatar: {
    root: { squareBorderRadius: tokenRef('radius-xs'), color: tokenRef('text-primary') },
  },
  divider: {
    root: { contentColor: tokenRef('text-primary') },
  },
  card: {
    root: { borderRadius: tokenRef('radius-sm'), shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.1)' },
  },
  panel: {
    root: { borderRadius: tokenRef('radius-xs'), titleFontWeight: tokenRef('font-weight-bold') },
  },
  fieldset: {
    root: {
      borderRadius: tokenRef('radius-xs'),
      padding: '8.75px 14px 14px 14px',
      legendHoverBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      legendBorderRadius: tokenRef('radius-xs'),
      legendBorderColor: tokenRef('surface-border'),
      legendFontWeight: tokenRef('font-weight-bold'),
    },
  },
  iconLink: {
    root: { activeColor: tokenRef('highlight-color') },
  },
  consoleLayout: {
    railItem: { activeColor: tokenRef('primary-soft-text') },
  },
};
