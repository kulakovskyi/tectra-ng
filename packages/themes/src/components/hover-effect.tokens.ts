/** Design tokens of `tx-hover-effect`: its colors, sizes and spacing. */
export const hoverEffectTokens = {
  root: {
    perspective: '100px',
    resetDuration: '600ms',
    resetEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

/** Type of `hoverEffectTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraHoverEffectTokens = typeof hoverEffectTokens;
