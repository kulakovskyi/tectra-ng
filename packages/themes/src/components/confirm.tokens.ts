import { joinCss, lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function badge(color: string, base: string, tint = '14%') {
  return { color, background: joinCss('color-mix(in srgb, ', tokenRef(`${base}-500`), ' ', tint, ', transparent)') };
}

/**
 * Design tokens of `tx-confirm-dialog` and `tx-confirm-popup`: colors, sizes and spacing of its root, icon,
 * message and popup, plus the severity variants.
 */
export const confirmTokens = {
  root: {
    gap: '14px',
    padding: '14px',
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('surface-ground'),
  },
  icon: {
    size: '38.5px',
    fontSize: tokenRef('font-size-md'),
  },
  message: {
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
    lineHeight: '1.625',
  },
  popup: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
    color: tokenRef('text-primary'),
    padding: '10.5px',
    gap: '7px',
    footerGap: '5.25px',
    maxWidth: 'min(340px, calc(100vw - 16px))',
    fontSize: tokenRef('font-size-md'),
    iconSize: '17.5px',
    arrowSize: '14px',
    arrowInset: '15.75px',
  },
  primary: { color: tokenRef('primary-base'), background: joinCss('color-mix(in srgb, ', tokenRef('primary-base'), ' 14%, transparent)') },
  info: badge(lightDark(tokenRef('blue-600'), tokenRef('blue-400')), 'blue'),
  success: badge(lightDark(tokenRef('green-700'), tokenRef('green-400')), 'green'),
  warn: badge(lightDark(tokenRef('amber-700'), tokenRef('amber-400')), 'amber', '16%'),
  danger: badge(lightDark(tokenRef('red-600'), tokenRef('red-400')), 'red'),
};

type ConfirmTokensShape = typeof confirmTokens;

/** Type of `confirmTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraConfirmTokens extends ConfirmTokensShape {}
