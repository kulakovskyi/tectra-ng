import { fade, joinCss, tokenRef } from './token-helpers';

/** Design tokens of `tx-color-swatches`: size, spacing and rings of the color dots, plus the `sm` and `lg` sizes. */
export const colorSwatchesTokens = {
  root: {
    gap: '6px',
    size: '22px',
    borderRadius: tokenRef('radius-full'),
    ringColor: fade(tokenRef('text-primary'), '88%'),
    hoverScale: '1.12',
    selectedRingColor: tokenRef('primary-base'),
    selectedRingWidth: '2px',
    selectedRingOffset: '2px',
    checkColor: tokenRef('surface-0'),
    checkShadow: joinCss('0 0 1.5px ', fade(tokenRef('surface-950'), '30%')),
    checkSize: '12px',
    checkStrokeWidth: '2.5',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingWidth: '2px',
    focusRingOffset: '2px',
    invalidRingColor: tokenRef('form-field-invalid-border-color'),
    disabledOpacity: '0.5',
    transitionDuration: tokenRef('motion-duration'),
    transitionEasing: tokenRef('motion-easing'),
  },
  sm: { size: '18px', gap: '4px', checkSize: '10px' },
  lg: { size: '28px', gap: '8px', checkSize: '15px' },
};

type ColorSwatchesTokensShape = typeof colorSwatchesTokens;

/** Type of `colorSwatchesTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraColorSwatchesTokens extends ColorSwatchesTokensShape {}
