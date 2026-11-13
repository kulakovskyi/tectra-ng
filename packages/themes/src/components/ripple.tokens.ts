/** Design tokens of `txRipple`: its colors, sizes and spacing. */
export const rippleTokens = {
  root: {
    color: 'currentColor',
    opacity: '0.2',
    enterDuration: '450ms',
    exitDuration: '350ms',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
};

/** Type of `rippleTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraRippleTokens = typeof rippleTokens;
