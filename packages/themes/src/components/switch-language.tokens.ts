import { joinCss, mix, tokenRef } from './token-helpers';

/** Design tokens of `tx-switch-language`: colors, sizes and spacing of its root, thumb and option. */
export const switchLanguageTokens = {
  root: {
    height: '37px',
    padding: '3px',
    borderRadius: tokenRef('radius-full'),
    background: tokenRef('surface-ground'),
    ringColor: tokenRef('surface-border'),
  },
  thumb: {
    background: tokenRef('surface-card'),
    ringColor: tokenRef('surface-border'),
    shadow: joinCss('0 1px 3px ', mix(tokenRef('text-primary'), '18%', 'transparent')),
    duration: '300ms',
    easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
  },
  option: {
    minWidth: '35px',
    paddingX: '10.5px',
    fontSize: '10.5px',
    fontWeight: tokenRef('font-weight-semibold'),
    letterSpacing: '0.04em',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    activeColor: tokenRef('text-primary'),
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
    transitionDuration: '200ms',
  },
};

type SwitchLanguageTokensShape = typeof switchLanguageTokens;

/** Type of `switchLanguageTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraSwitchLanguageTokens extends SwitchLanguageTokensShape {}
