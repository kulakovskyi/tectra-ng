import { lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function tone(palette: string) {
  const color = lightDark(tokenRef(`${palette}-800`), tokenRef(`${palette}-300`));
  return { color, background: color };
}

/**
 * Design tokens of `tx-tag`: colors, sizes and spacing of its root and list, plus the `sm` and `lg` sizes and
 * the severity variants.
 */
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
  secondary: { color: tokenRef('text-muted'), background: tokenRef('text-muted') },
  success: tone('green'),
  info: tone('sky'),
  warn: tone('orange'),
  danger: tone('red'),
  help: tone('purple'),
  contrast: { color: tokenRef('text-primary'), background: tokenRef('text-primary') },
  list: {
    gap: '4px',
    popoverGap: '6px',
    popoverPadding: '0',
    popoverMaxWidth: '280px',
    popoverMaxHeight: '280px',
    emptyColor: tokenRef('text-muted'),
  },
};

/** Design tokens of `tx-chip`: its colors, sizes and spacing. */
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
    focusRingWidth: '2px',
    focusRingOffset: '1px',
    focusRingShadow: 'none',
  },
};

type TagTokensShape = typeof tagTokens;

/** Type of `tagTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraTagTokens extends TagTokensShape {}
type ChipTokensShape = typeof chipTokens;

/** Type of `chipTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraChipTokens extends ChipTokensShape {}
