import { joinCss, lightDark, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-menu`: colors, sizes and spacing of its root, item, icon, shortcut, group label and
 * other parts.
 */
export const menuTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    shadow: tokenRef('shadow-overlay'),
    padding: '3.5px',
    gap: '2px',
    minWidth: '200px',
    maxHeight: 'min(420px, calc(100dvh - 32px))',
    fontSize: tokenRef('font-size-md'),
    lineHeight: '1.45',
  },
  item: {
    padding: '7px 10.5px',
    gap: '7px',
    borderRadius: tokenRef('radius-sm'),
    color: tokenRef('text-primary'),
    fontWeight: tokenRef('font-weight-regular'),
    focusBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    focusColor: tokenRef('text-hover'),
    activeBackground: tokenRef('menu-item-focus-background'),
    disabledOpacity: '0.6',
    dangerColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    dangerFocusBackground: lightDark(tokenRef('red-50'), joinCss('color-mix(in srgb, ', tokenRef('red-400'), ', transparent 96%)')),
  },
  icon: {
    color: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
    focusColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
    size: tokenRef('font-size-md'),
  },
  shortcut: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-xs'),
  },
  groupLabel: {
    padding: '3.5px 8.75px',
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  submenuIcon: {
    size: '10.5px',
  },
  separator: {
    color: tokenRef('surface-border'),
    margin: '2px 0',
  },
  popup: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    padding: '5.25px',
    gap: '1.75px',
    minWidth: '168px',
    itemPadding: '7px 10.5px',
    itemGap: '8.75px',
    itemBorderRadius: tokenRef('radius-md'),
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-medium'),
    itemBorderWidth: '1px',
  },
  arrow: {
    size: '14px',
    inset: '15.75px',
    background: 'initial',
    borderColor: 'initial',
    borderWidth: '1px',
    shadow: 'none',
  },
  context: {
    background: joinCss('color-mix(in srgb, ', tokenRef('surface-card'), ' 92%, transparent)'),
    borderColor: tokenRef('surface-border'),
    blur: '24px',
    padding: '3.5px',
    minWidth: '196px',
    maxWidth: '280px',
    maxHeight: 'min(70vh, 448px)',
    itemPadding: '5.25px 7px',
    itemGap: '8.75px',
    iconButtonSize: '21px',
    iconButtonFontSize: '10.5px',
    iconButtonBorderRadius: tokenRef('radius-md'),
    disabledOpacity: '0.5',
    itemBorderRadius: tokenRef('radius-md'),
    fontSize: '12.25px',
  },
};

type MenuTokensShape = typeof menuTokens;

/** Type of `menuTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraMenuTokens extends MenuTokensShape {}
