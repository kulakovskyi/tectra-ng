import { lightDark, tokenRef } from './token-helpers';

export const menubarTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    gap: '7px',
    padding: '5.25px',
    fontSize: tokenRef('font-size-md'),
    transitionDuration: tokenRef('motion-duration'),
  },
  item: {
    padding: '7px 10.5px',
    gap: '7px',
    borderRadius: tokenRef('radius-sm'),
    color: tokenRef('text-primary'),
    fontWeight: tokenRef('font-weight-regular'),
    focusBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    focusColor: tokenRef('text-hover'),
    activeBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    activeColor: tokenRef('text-hover'),
    disabledOpacity: '0.6',
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '-2px',
    icon: {
      size: '14px',
      color: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
      focusColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
      activeColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
    },
  },
  submenuIcon: {
    size: '10.5px',
    color: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
    focusColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
  },
  mobileButton: {
    size: '21px',
    borderRadius: '50%',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-muted-hover'),
    hoverBackground: tokenRef('surface-hover'),
  },
  mobile: {
    padding: '5.25px',
    gap: '2px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
    indent: '12.25px',
    offset: '4px',
    expandDuration: '0.25s',
    expandEasing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
};

export type TectraMenubarTokens = typeof menubarTokens;
