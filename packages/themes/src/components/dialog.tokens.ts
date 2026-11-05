import { lightDark, tokenRef } from './token-helpers';

export const dialogTokens = {
  root: {
    background: tokenRef('surface-overlay'),
    borderColor: lightDark(tokenRef('surface-200'), tokenRef('surface-800')),
    borderWidth: '1px',
    borderRadius: tokenRef('radius-xl'),
    color: tokenRef('text-primary'),
    shadow: tokenRef('shadow-modal'),
    maxHeight: '90%',
    positionMargin: '10.5px',
    fontSize: tokenRef('font-size-md'),
    lineHeight: '1.45',
    enterDuration: '0.15s',
    leaveDuration: '0.15s',
  },
  mask: {
    background: tokenRef('mask-background'),
  },
  header: {
    padding: '17.5px 21px',
    gap: '7px',
  },
  title: {
    fontSize: '15.75px',
    fontWeight: tokenRef('font-weight-semibold'),
  },
  subtitle: {
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
  },
  content: {
    padding: '0 21px',
    lastPaddingBottom: '21px',
  },
  footer: {
    padding: '21px',
    gap: '7px',
  },
  focusRing: {
    width: '2px',
    color: tokenRef('focus-ring-color'),
  },
  sm: { width: '500px' },
  md: { width: '700px' },
  lg: { width: '900px' },
  xl: { width: '1100px' },
  drawer: {
    sm: '320px',
    md: '440px',
    lg: '640px',
    background: tokenRef('surface-card'),
    dividerColor: tokenRef('surface-border'),
    headerPadding: '10.5px 17.5px',
    titleFontSize: tokenRef('font-size-md'),
    contentPadding: '14px 17.5px',
    footerPadding: '10.5px 17.5px',
  },
};

export type TectraDialogTokens = typeof dialogTokens;
