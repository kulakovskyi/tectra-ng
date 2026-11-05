import { lightDark, tokenRef } from './token-helpers';

function tone(palette: string) {
  return { tone: lightDark(tokenRef(`${palette}-600`), tokenRef(`${palette}-400`)) };
}

export const confirmTokens = {
  root: {
    gap: '14px',
    messageColor: tokenRef('text-muted'),
  },
  icon: {
    size: '40px',
    fontSize: '18px',
    tint: '14%',
  },
  popup: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
    color: tokenRef('text-primary'),
    padding: '14px 16px',
    gap: '12px',
    maxWidth: 'min(340px, calc(100vw - 16px))',
    fontSize: tokenRef('font-size-md'),
    iconSize: '28px',
    iconFontSize: '14px',
    arrowSize: '10px',
  },
  primary: tone('primary'),
  info: tone('sky'),
  success: tone('green'),
  warn: tone('orange'),
  danger: tone('red'),
};

export type TectraConfirmTokens = typeof confirmTokens;
