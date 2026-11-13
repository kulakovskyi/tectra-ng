import { tokenRef } from './token-helpers';

/** Design tokens of `tx-mascot`: its colors, sizes and spacing. */
export const mascotTokens = {
  root: {
    size: '48px',
    bodyColor: tokenRef('primary-base'),
    shadeColor: tokenRef('primary-700'),
    glowColor: tokenRef('primary-300'),
    eyeColor: tokenRef('surface-card'),
  },
};

/** Type of `mascotTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraMascotTokens = typeof mascotTokens;
