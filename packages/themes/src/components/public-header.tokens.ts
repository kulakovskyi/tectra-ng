import { mix, tokenRef } from './token-helpers';

const focusRing = `0 0 0 2px ${tokenRef('surface-card')}, 0 0 0 4px ${tokenRef('focus-ring-color')}`;

export const publicHeaderTokens = {
  root: {
    height: '56px',
    maxWidth: '1064px',
    paddingX: '17.5px',
    gap: '21px',
    background: mix(tokenRef('surface-card'), '78%', 'transparent'),
    backdropFilter: 'blur(24px) saturate(1.5)',
    borderColor: tokenRef('surface-border'),
    zIndex: '50',
    focusRingShadow: focusRing,
  },
  brand: {
    gap: '8.75px',
    logoWidth: '28px',
    fontSize: '15.75px',
    fontWeight: tokenRef('font-weight-semibold'),
    letterSpacing: '-0.02em',
    color: tokenRef('text-primary'),
    borderRadius: tokenRef('radius-md'),
  },
  nav: {
    gap: '3.5px',
    linkPaddingX: '10.5px',
    linkPaddingY: '7px',
    linkBorderRadius: tokenRef('radius-full'),
    linkFontSize: '12.25px',
    linkColor: tokenRef('text-muted'),
    linkHoverColor: tokenRef('text-primary'),
    linkHoverBackground: 'transparent',
  },
  end: {
    gap: '10.5px',
    actionsGap: '7px',
  },
  toggle: {
    size: '35px',
    iconSize: '15.75px',
    color: tokenRef('text-primary'),
    ringColor: tokenRef('surface-border'),
    hoverBackground: tokenRef('surface-hover'),
  },
  panel: {
    padding: '10.5px 17.5px 17.5px',
    gap: '14px',
    background: tokenRef('surface-card'),
    shadow: tokenRef('shadow-overlay'),
    linkPadding: '10.5px 7px',
    linkBorderRadius: '0',
    linkFontSize: '14px',
    linkColor: tokenRef('text-primary'),
    duration: '200ms',
  },
};

export type TectraPublicHeaderTokens = typeof publicHeaderTokens;
