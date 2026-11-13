import { fade, lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-actions-menu`: colors, sizes and spacing of its list and item. */
export const actionsMenuTokens = {
  list: {
    gap: '1.75px',
    minWidth: '168px',
    padding: '5.25px',
  },
  item: {
    gap: '8.75px',
    paddingX: '10.5px',
    paddingY: '7px',
    borderRadius: tokenRef('radius-md'),
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-medium'),
    lineHeight: '16px',
    color: tokenRef('text-primary'),
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    dangerColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    dangerHoverBackground: lightDark(tokenRef('red-50'), fade(tokenRef('red-400'), '96%')),
    dangerActiveBackground: lightDark(tokenRef('red-100'), fade(tokenRef('red-400'), '84%')),
    focusRingColor: tokenRef('focus-ring-color'),
    transitionDuration: '150ms',
  },
};

/** Type of `actionsMenuTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraActionsMenuTokens = typeof actionsMenuTokens;
