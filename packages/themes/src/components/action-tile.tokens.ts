import { joinCss, mix, tokenRef } from './token-helpers';

export const actionTileTokens = {
  root: {
    gap: '12.25px',
    padding: '12.25px',
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    hoverBorderColor: tokenRef('primary-base'),
    hoverBackground: tokenRef('surface-hover'),
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
    disabledOpacity: '0.6',
    transitionDuration: '150ms',
  },
  icon: {
    size: '35px',
    borderRadius: tokenRef('radius-md'),
    fontSize: '14px',
    color: tokenRef('primary-base'),
    background: mix(tokenRef('primary-base'), '12%', 'transparent'),
  },
  body: {
    gap: '1.75px',
  },
  title: {
    fontSize: '13.125px',
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.375',
    color: tokenRef('text-primary'),
  },
  text: {
    fontSize: '12.25px',
    lineHeight: '1.375',
    color: tokenRef('text-muted'),
  },
  end: {
    fontSize: '12.25px',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('primary-base'),
    hoverShift: '1.75px',
  },
};

export type TectraActionTileTokens = typeof actionTileTokens;
