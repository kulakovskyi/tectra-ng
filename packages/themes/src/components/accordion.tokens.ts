import { lightDark, tokenRef } from './token-helpers';

export const accordionTokens = {
  root: {
    transitionDuration: '0.15s',
    expandDuration: '0.25s',
    expandEasing: 'cubic-bezier(0.2, 0, 0, 1)',
    disabledOpacity: '0.6',
  },
  panel: {
    borderWidth: '0',
    borderColor: tokenRef('surface-border'),
  },
  header: {
    padding: '14px',
    gap: '7px',
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    activeColor: tokenRef('text-primary'),
    activeHoverColor: tokenRef('text-primary'),
    background: tokenRef('surface-card'),
    hoverBackground: tokenRef('surface-card'),
    activeBackground: tokenRef('surface-card'),
    activeHoverBackground: tokenRef('surface-card'),
    borderWidth: '0 1px 1px 1px',
    borderColor: tokenRef('surface-border'),
    borderRadius: '0',
    focusRing: {
      width: '2px',
      color: tokenRef('focus-ring-color'),
      offset: '-1px',
    },
    toggleIcon: {
      size: '14px',
      color: tokenRef('text-muted'),
      hoverColor: tokenRef('text-primary'),
      activeColor: tokenRef('text-primary'),
      activeHoverColor: tokenRef('text-primary'),
    },
    first: {
      borderWidth: '1px',
      topBorderRadius: tokenRef('radius-lg'),
    },
    last: {
      bottomBorderRadius: tokenRef('radius-lg'),
      activeBottomBorderRadius: '0',
    },
  },
  content: {
    padding: '15px 14px 14px 14px',
    borderWidth: '0 1px 1px 1px',
    borderColor: tokenRef('surface-border'),
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    lastBottomBorderRadius: tokenRef('radius-lg'),
  },
  tone: {
    width: '3px',
    info: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    success: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    warn: lightDark(tokenRef('orange-600'), tokenRef('orange-400')),
    danger: lightDark(tokenRef('red-600'), tokenRef('red-400')),
  },
};

export type TectraAccordionTokens = typeof accordionTokens;
