/** Design tokens of `tx-split-button`: its colors, sizes and spacing. */
export const splitButtonTokens = {
  root: {
    dividerColor: 'color-mix(in srgb, currentColor 32%, transparent)',
    dividerWidth: '0px',
  },
};

type SplitButtonTokensShape = typeof splitButtonTokens;

/** Type of `splitButtonTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraSplitButtonTokens extends SplitButtonTokensShape {}
