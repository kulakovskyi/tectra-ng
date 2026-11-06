import { lightDark, tokenRef } from './token-helpers';

export const treeTokens = {
  root: {
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    padding: '12.25px',
    gap: '2px',
    indent: '12.25px',
    transitionDuration: tokenRef('motion-duration'),
  },
  node: {
    padding: '3.5px 7px',
    borderRadius: tokenRef('radius-lg'),
    hoverBackground: tokenRef('surface-hover'),
    selectedBackground: tokenRef('highlight-background'),
    color: tokenRef('text-primary'),
    hoverColor: tokenRef('text-hover'),
    selectedColor: tokenRef('highlight-color'),
    gap: '5.25px',
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '-1px', shadow: 'none' },
  },
  nodeIcon: {
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-muted-hover'),
    selectedColor: tokenRef('highlight-color'),
  },
  nodeLabel: {
    fontWeight: tokenRef('font-weight-regular'),
    selectedFontWeight: tokenRef('font-weight-regular'),
    fontSize: tokenRef('font-size-md'),
  },
  nodeToggleButton: {
    borderRadius: '50%',
    size: '21px',
    hoverBackground: tokenRef('surface-hover'),
    selectedHoverBackground: tokenRef('surface-card'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-muted-hover'),
    selectedHoverColor: tokenRef('primary-base'),
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '2px' },
  },
  loadingIcon: {
    size: '24.5px',
  },
  filter: {
    margin: '0 0 7px 0',
  },
  mask: {
    background: lightDark('rgba(255, 255, 255, 0.5)', 'rgba(0, 0, 0, 0.3)'),
  },
  dropPoint: {
    color: tokenRef('primary-base'),
  },
  expansion: {
    duration: `calc(${tokenRef('motion-duration')} * 1.6)`,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
};

export type TectraTreeTokens = typeof treeTokens;

export const treeTableTokens = {
  node: {
    indent: '16px',
    gap: '7px',
  },
};

export type TectraTreeTableTokens = typeof treeTableTokens;
