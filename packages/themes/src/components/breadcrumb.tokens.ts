import { lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-breadcrumb`: colors, sizes and spacing of its root, item, current, separator and slash. */
export const breadcrumbTokens = {
  root: {
    padding: '0',
    background: 'transparent',
    gap: '7px',
    transitionDuration: tokenRef('motion-duration'),
  },
  item: {
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    textColor: tokenRef('text-muted'),
    linkDecoration: 'underline',
    linkDecorationColor: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    linkHoverDecorationColor: 'currentColor',
    linkDecorationThickness: '1px',
    linkUnderlineOffset: '3px',
    borderRadius: tokenRef('radius-lg'),
    gap: '7px',
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-regular'),
    iconColor: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
    iconHoverColor: lightDark(tokenRef('surface-500'), tokenRef('surface-400')),
    iconSize: '14px',
    disabledOpacity: '0.6',
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '2px',
  },
  current: {
    color: tokenRef('text-primary'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  separator: {
    color: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
    iconSize: '14px',
  },
  slash: {
    color: tokenRef('surface-border'),
    fontSize: '15.75px',
  },
};

type BreadcrumbTokensShape = typeof breadcrumbTokens;

/** Type of `breadcrumbTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraBreadcrumbTokens extends BreadcrumbTokensShape {}
