import { lightDark, tokenRef } from './token-helpers';

export const emptyStateTokens = {
  root: {
    gap: '10.5px',
    padding: '35px 21px',
    color: tokenRef('text-primary'),
  },
  framed: {
    padding: '49px 21px',
    minHeight: '252px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-lg'),
  },
  inset: {
    padding: '28px 21px',
    background: tokenRef('surface-ground'),
    borderRadius: tokenRef('radius-lg'),
  },
  icon: {
    size: '42px',
    fontSize: '17.5px',
    borderRadius: tokenRef('radius-full'),
    tint: '12%',
  },
  body: {
    gap: '3.5px',
  },
  title: {
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  text: {
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
    lineHeight: '1.375',
    maxWidth: '392px',
  },
  large: {
    padding: '42px 28px',
    iconSize: '49px',
    iconFontSize: '21px',
    iconBorderRadius: tokenRef('radius-xl'),
    titleFontSize: '17.5px',
  },
  compact: {
    padding: '14px',
    gap: '8.75px',
    iconSize: '28px',
    iconFontSize: '12.25px',
  },
  tone: {
    primary: tokenRef('primary-base'),
    neutral: tokenRef('text-muted'),
    success: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    info: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    warn: lightDark(tokenRef('orange-600'), tokenRef('orange-400')),
    danger: lightDark(tokenRef('red-600'), tokenRef('red-400')),
  },
};

export type TectraEmptyStateTokens = typeof emptyStateTokens;
