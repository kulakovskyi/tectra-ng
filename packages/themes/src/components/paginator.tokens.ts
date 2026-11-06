import { tokenRef } from './token-helpers';

export const paginatorTokens = {
  root: {
    padding: '7px',
    gap: '3.5px',
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    transitionDuration: tokenRef('motion-duration'),
  },
  navButton: {
    background: 'transparent',
    hoverBackground: tokenRef('surface-hover'),
    selectedBackground: tokenRef('primary-base'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-muted-hover'),
    selectedColor: tokenRef('primary-contrast'),
    width: '31.5px',
    height: '31.5px',
    borderRadius: tokenRef('radius-md'),
    fontWeight: tokenRef('font-weight-regular'),
    fontSize: tokenRef('font-size-md'),
    iconSize: '14px',
    disabledOpacity: '0.6',
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '2px' },
  },
  currentPageReport: {
    color: tokenRef('text-muted'),
    fontWeight: tokenRef('font-weight-regular'),
    fontSize: tokenRef('font-size-md'),
  },
  jumpToPageInput: {
    maxWidth: '31.5px',
  },
  total: {
    color: tokenRef('text-primary'),
    fontWeight: tokenRef('font-weight-bold'),
    fontSize: tokenRef('font-size-md'),
    margin: '10.5px 0',
  },
};

export type TectraPaginatorTokens = typeof paginatorTokens;
