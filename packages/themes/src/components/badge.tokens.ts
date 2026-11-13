import { lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function severity(group: string) {
  return { background: tokenRef(`${group}-base`), color: tokenRef(`${group}-contrast`) };
}

/**
 * Design tokens of `tx-badge`: colors, sizes and spacing of its root and dot, plus the `sm`, `lg` and `xl`
 * sizes and the severity variants.
 */
export const badgeTokens = {
  root: {
    borderRadius: tokenRef('radius-full'),
    padding: '0 6px',
    fontSize: '11px',
    fontWeight: tokenRef('font-weight-bold'),
    minWidth: '18px',
    height: '18px',
  },
  dot: { size: '8px' },
  sm: { fontSize: '10px', minWidth: '16px', height: '16px' },
  lg: { fontSize: '12px', minWidth: '22px', height: '22px' },
  xl: { fontSize: '14px', minWidth: '26px', height: '26px' },
  primary: severity('primary'),
  secondary: {
    background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    color: lightDark(tokenRef('surface-700'), tokenRef('surface-200')),
  },
  success: severity('success'),
  info: severity('info'),
  warn: severity('warn'),
  danger: severity('danger'),
  help: severity('help'),
  contrast: severity('contrast'),
};

type BadgeTokensShape = typeof badgeTokens;

/** Type of `badgeTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraBadgeTokens extends BadgeTokensShape {}
