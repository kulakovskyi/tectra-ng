import { lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function fill(palette: string) {
  return lightDark(tokenRef(`${palette}-600`), tokenRef(`${palette}-400`));
}

/**
 * Design tokens of `tx-progress-bar`: its colors, sizes and spacing, plus the `sm` and `lg` sizes and the
 * severity variants.
 */
export const progressBarTokens = {
  root: {
    height: '6px',
    borderRadius: tokenRef('radius-full'),
    trackBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    gap: '10px',
    labelColor: tokenRef('text-muted'),
    labelFontSize: tokenRef('font-size-sm'),
    labelFontWeight: tokenRef('font-weight-medium'),
    transitionDuration: '0.4s',
    indeterminateDuration: '1.4s',
  },
  sm: { height: '4px' },
  lg: { height: '10px' },
  primary: tokenRef('primary-base'),
  secondary: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
  success: fill('green'),
  info: fill('sky'),
  warn: fill('orange'),
  danger: fill('red'),
  help: fill('purple'),
  contrast: tokenRef('text-primary'),
};

/** Design tokens of `tx-progress-spinner`: its colors, sizes and spacing, plus the `sm` and `lg` sizes. */
export const progressSpinnerTokens = {
  root: {
    color: tokenRef('primary-base'),
    trackColor: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    size: '32px',
    duration: '0.8s',
    reducedDuration: '2.4s',
  },
  sm: { size: '20px' },
  lg: { size: '48px' },
};

/** Type of `progressBarTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraProgressBarTokens = typeof progressBarTokens;
/** Type of `progressSpinnerTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraProgressSpinnerTokens = typeof progressSpinnerTokens;
