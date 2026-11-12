import { joinCss, mix, tokenRef } from './token-helpers';

export const switchThemeTokens = {
  root: {
    size: '37px',
    borderRadius: tokenRef('radius-full'),
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    ringColor: mix(tokenRef('text-primary'), '14%', 'transparent'),
    shadow: '0 1px 2px rgb(0 0 0 / 0.06)',
    hoverBackground: tokenRef('surface-hover'),
    activeScale: '0.9',
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
    transitionDuration: '200ms',
  },
  icon: {
    size: '14px',
    duration: '500ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    hiddenScale: '0.5',
  },
};

export type TectraSwitchThemeTokens = typeof switchThemeTokens;
