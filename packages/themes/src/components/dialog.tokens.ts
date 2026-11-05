import { fade, tokenRef } from './token-helpers';

export const dialogTokens = {
  root: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderWidth: '1px',
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    shadow: tokenRef('shadow-modal'),
    inset: '16px',
    fontSize: tokenRef('font-size-md'),
    enterDuration: '0.2s',
    leaveDuration: '0.14s',
  },
  mask: {
    background: tokenRef('mask-background'),
  },
  header: {
    padding: '20px 24px 4px',
    gap: '12px',
  },
  title: {
    fontSize: tokenRef('font-size-lg'),
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.35',
  },
  subtitle: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-sm'),
  },
  content: {
    padding: '12px 24px',
    lineHeight: '1.5',
  },
  footer: {
    padding: '12px 24px 20px',
    gap: '8px',
  },
  headerButton: {
    size: '32px',
    borderRadius: tokenRef('radius-md'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: fade(tokenRef('text-primary'), '92%'),
  },
  focusRing: {
    width: '2px',
    color: tokenRef('focus-ring-color'),
  },
  sm: { width: '420px' },
  md: { width: '640px' },
  lg: { width: '880px' },
  xl: { width: '1120px' },
  drawer: {
    sm: '320px',
    md: '440px',
    lg: '640px',
  },
};

export type TectraDialogTokens = typeof dialogTokens;
