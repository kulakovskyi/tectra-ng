import { fade, lightDark, tokenRef } from './token-helpers';

function tone(palette: string) {
  return { tone: lightDark(tokenRef(`${palette}-600`), tokenRef(`${palette}-400`)) };
}

export const toastTokens = {
  root: {
    width: '360px',
    inset: '16px',
    gap: '10px',
  },
  item: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
    color: tokenRef('text-primary'),
    paddingY: '12px',
    paddingStart: '16px',
    paddingEnd: '10px',
    gap: '12px',
    fontSize: tokenRef('font-size-md'),
    lineHeight: '1.45',
    accentWidth: '3px',
    enterDuration: '0.2s',
    leaveDuration: '0.15s',
  },
  title: {
    fontWeight: tokenRef('font-weight-semibold'),
  },
  text: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-sm'),
  },
  icon: {
    size: '28px',
    fontSize: '14px',
    tint: '15%',
  },
  actions: {
    gap: '6px',
  },
  closeButton: {
    size: '26px',
    borderRadius: tokenRef('radius-md'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: fade(tokenRef('text-primary'), '92%'),
  },
  progress: {
    height: '3px',
  },
  success: tone('green'),
  info: tone('sky'),
  warn: tone('orange'),
  danger: tone('red'),
  secondary: { tone: tokenRef('text-muted') },
  contrast: { tone: tokenRef('text-primary') },
};

export type TectraToastTokens = typeof toastTokens;
