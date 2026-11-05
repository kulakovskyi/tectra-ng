import { lightDark, tokenRef } from './token-helpers';

export const menuTokens = {
  root: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    shadow: tokenRef('shadow-overlay'),
    padding: '4px',
    minWidth: '200px',
    maxHeight: 'min(420px, calc(100vh - 32px))',
    fontSize: tokenRef('font-size-md'),
    gap: '1px',
  },
  inline: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
  },
  item: {
    padding: '7px 10px',
    gap: '10px',
    borderRadius: tokenRef('radius-sm'),
    color: tokenRef('text-primary'),
    focusBackground: tokenRef('list-focus-background'),
    focusColor: tokenRef('text-primary'),
    activeBackground: tokenRef('highlight-background'),
    activeColor: tokenRef('highlight-color'),
    disabledOpacity: '0.5',
    dangerColor: lightDark(tokenRef('red-700'), tokenRef('red-400')),
    dangerFocusBackground: lightDark(tokenRef('red-50'), `color-mix(in srgb, ${tokenRef('red-400')} 14%, transparent)`),
  },
  icon: {
    color: tokenRef('text-muted'),
    size: '15px',
  },
  shortcut: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-xs'),
  },
  groupLabel: {
    padding: '8px 10px 4px',
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-xs'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  separator: {
    color: tokenRef('surface-border'),
    margin: '4px 6px',
  },
};

export type TectraMenuTokens = typeof menuTokens;
