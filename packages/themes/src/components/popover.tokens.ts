import { tokenRef } from './token-helpers';

export const popoverTokens = {
  root: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderWidth: '1px',
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    shadow: tokenRef('shadow-overlay'),
    minWidth: '200px',
    maxWidth: 'min(420px, calc(100vw - 16px))',
    padding: '14px 16px',
    gap: '10px',
    fontSize: tokenRef('font-size-md'),
  },
  header: {
    gap: '8px',
  },
  title: {
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  footer: {
    gap: '8px',
  },
  closeButton: {
    size: '28px',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: tokenRef('surface-hover'),
    borderRadius: tokenRef('radius-sm'),
  },
  arrow: {
    size: '10px',
    inset: '14px',
  },
  focusRing: {
    width: '2px',
    color: tokenRef('focus-ring-color'),
  },
};

export type TectraPopoverTokens = typeof popoverTokens;
