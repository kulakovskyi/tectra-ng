import { fade, lightDark, tokenRef } from '../../components/token-helpers';

export const softGlow = (color: string) => lightDark(fade(tokenRef(color), '72%'), fade(tokenRef(color), '62%'));
export const softFocusShadow = (color = 'primary-base') => `0 0 0 3px ${softGlow(color)}`;
export const softFill = lightDark(tokenRef('surface-100'), tokenRef('surface-800'));
export const softFillHover = lightDark(tokenRef('surface-200'), tokenRef('surface-700'));
export const softLine = lightDark(tokenRef('surface-300'), tokenRef('surface-600'));
export const softCardShadow = `0 1px 2px ${fade(tokenRef('surface-950'), '96%')}, 0 8px 24px -12px ${fade(tokenRef('surface-950'), '86%')}`;
