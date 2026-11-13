import { joinCss, lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function tone(palette: string) {
  return { tone: lightDark(tokenRef(`${palette}-600`), tokenRef(`${palette}-400`)) };
}

/**
 * Design tokens of `tx-toast`: colors, sizes and spacing of its root, item, icon, text, close button and
 * other parts, plus the severity variants.
 */
export const toastTokens = {
  root: {
    width: 'min(448px, calc(100vw - 28px))',
    insetX: '28px',
    insetTop: '70px',
    insetBottom: '28px',
    gap: '8px',
    duration: '0.3s',
  },
  item: {
    background: joinCss('color-mix(in srgb, ', tokenRef('surface-card'), ' 88%, transparent)'),
    blur: '24px',
    ringColor: tokenRef('surface-border'),
    shadow: tokenRef('shadow-overlay'),
    color: tokenRef('text-primary'),
    borderRadius: '24.5px',
    gap: '10.5px',
    paddingY: '8.75px',
    paddingStart: '8.75px',
    paddingEnd: '17.5px',
    loadingPaddingEnd: '8.75px',
    fontSize: '13.125px',
    fontWeight: tokenRef('font-weight-medium'),
  },
  icon: {
    size: '31.5px',
    fontSize: '12.25px',
    strokeWidth: '2.5',
    tint: '14%',
  },
  text: {
    paddingY: '5.25px',
    lineHeight: '21px',
    lines: '3',
  },
  closeButton: {
    size: '21px',
    offset: '-5.25px',
    fontSize: '8.75px',
    background: tokenRef('surface-card'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    ringColor: tokenRef('surface-border'),
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  action: {
    padding: '5.25px 12.25px',
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-semibold'),
    tint: '14%',
    hoverTint: '22%',
  },
  focusRing: {
    shadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('primary-base')),
  },
  progress: {
    height: '2px',
  },
  info: tone('sky'),
  success: tone('green'),
  warn: tone('amber'),
  danger: tone('red'),
  secondary: { tone: tokenRef('text-muted') },
  contrast: { tone: tokenRef('text-primary') },
};

type ToastTokensShape = typeof toastTokens;

/** Type of `toastTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraToastTokens extends ToastTokensShape {}
