/** Design tokens of `tx-icon`: its colors, sizes and spacing. */
export const iconTokens = {
  root: {
    size: '1em',
    strokeWidth: '1.75',
  },
};

type IconTokensShape = typeof iconTokens;

/** Type of `iconTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraIconTokens extends IconTokensShape {}
