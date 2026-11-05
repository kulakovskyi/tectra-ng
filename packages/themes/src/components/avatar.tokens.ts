import { lightDark, tokenRef } from './token-helpers';

function tone(palette: string) {
  return {
    background: lightDark(tokenRef(`${palette}-100`), `color-mix(in srgb, ${tokenRef(`${palette}-400`)} 22%, ${tokenRef('surface-900')})`),
    color: lightDark(tokenRef(`${palette}-700`), tokenRef(`${palette}-200`)),
  };
}

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
  },
};

export type TectraAvatarTokens = typeof avatarTokens;
