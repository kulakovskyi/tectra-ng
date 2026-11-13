import { joinCss, lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function tone(palette: string) {
  return {
    background: lightDark(tokenRef(`${palette}-100`), joinCss('color-mix(in srgb, ', tokenRef(`${palette}-400`), ' 22%, ', tokenRef('surface-900'), ')')),
    color: lightDark(tokenRef(`${palette}-700`), tokenRef(`${palette}-200`)),
  };
}

/**
 * Design tokens of `tx-avatar`: colors, sizes and spacing of its root, group, editor and list, plus the `sm`,
 * `lg` and `xl` sizes and the tone variants.
 */
export const avatarTokens = {
  root: {
    size: '36px',
    fontWeight: tokenRef('font-weight-semibold'),
    fontScale: '0.4',
    iconScale: '0.5',
    squareBorderRadius: tokenRef('radius-lg'),
    background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    color: tokenRef('text-muted'),
  },
  sm: { size: '28px' },
  lg: { size: '44px' },
  xl: { size: '64px' },
  tones: {
    blue: tone('primary'),
    green: tone('green'),
    sky: tone('sky'),
    orange: tone('orange'),
    purple: tone('purple'),
    red: tone('red'),
  },
  group: {
    overlap: '0.18',
    ringWidth: '2px',
    ringColor: tokenRef('surface-card'),
    moreBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    moreColor: tokenRef('text-muted'),
    moreFocusRingWidth: '2px',
    moreFocusRingOffset: '2px',
    moreFocusRingColor: tokenRef('focus-ring-color'),
    endGap: '6px',
    addBackground: tokenRef('surface-ground'),
    addBorderColor: tokenRef('surface-border'),
    addHoverBorderColor: tokenRef('primary-base'),
    addColor: tokenRef('primary-base'),
    addIconScale: '0.45',
  },
  editor: {
    size: '112px',
    gap: '12px',
    ringWidth: '4px',
    ringColor: joinCss('color-mix(in srgb, ', tokenRef('primary-base'), ' 14%, transparent)'),
    badgeRingWidth: '4px',
    badgeRingColor: tokenRef('surface-card'),
    badgeSize: '30px',
    loaderBackground: joinCss('color-mix(in srgb, ', tokenRef('surface-card'), ' 75%, transparent)'),
    dropRingColor: tokenRef('primary-base'),
    hintMaxWidth: '240px',
    hintFontSize: tokenRef('font-size-xs'),
    hintLineHeight: '1.375',
    hintColor: tokenRef('text-muted'),
    transitionDuration: tokenRef('motion-duration'),
  },
  list: {
    padding: '0',
    gap: '8px',
    itemGap: '8px',
    maxHeight: '280px',
    nameFontSize: tokenRef('font-size-md'),
    nameColor: tokenRef('text-primary'),
  },
};

type AvatarTokensShape = typeof avatarTokens;

/** Type of `avatarTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraAvatarTokens extends AvatarTokensShape {}
