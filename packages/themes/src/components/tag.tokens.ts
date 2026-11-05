import { lightDark, tokenRef } from './token-helpers';

function tone(palette: string) {
  return { color: lightDark(tokenRef(`${palette}-700`), tokenRef(`${palette}-300`)) };
}

export const tagTokens = {
  root: {
    gap: '4px',
    paddingX: '7px',
    paddingY: '2px',
    borderRadius: tokenRef('radius-sm'),
    roundedBorderRadius: tokenRef('radius-full'),
    fontSize: '12px',
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.4',
    tint: '14%',
    iconSize: '0.95em',
    actionSize: '16px',
    focusRingColor: tokenRef('focus-ring-color'),
  },
  sm: { fontSize: '11px', paddingX: '5px', paddingY: '1px' },
  lg: { fontSize: '14px', paddingX: '9px', paddingY: '3px', gap: '6px' },
  primary: tone('primary'),
  secondary: { color: tokenRef('text-muted') },
  success: tone('green'),
  info: tone('sky'),
  warn: tone('orange'),
  danger: tone('red'),
  help: tone('purple'),
  contrast: { color: tokenRef('text-primary') },
};

export const chipTokens = {
  root: {
    gap: '6px',
    height: '30px',
    paddingX: '12px',
    borderRadius: tokenRef('radius-full'),
    background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    iconColor: tokenRef('text-muted'),
    imageSize: '24px',
    removeSize: '18px',
    removeColor: tokenRef('text-muted'),
    removeHoverColor: tokenRef('text-primary'),
    removeHoverBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    focusRingColor: tokenRef('focus-ring-color'),
  },
};

export type TectraTagTokens = typeof tagTokens;
export type TectraChipTokens = typeof chipTokens;
