import { tokenRef } from './token-helpers';

export const mascotTokens = {
  root: {
    size: '48px',
    bodyColor: tokenRef('primary-base'),
    shadeColor: tokenRef('primary-700'),
    glowColor: tokenRef('primary-300'),
    eyeColor: tokenRef('surface-card'),
  },
};

export type TectraMascotTokens = typeof mascotTokens;
