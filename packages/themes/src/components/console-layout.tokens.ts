import { mix, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-console-layout`: colors, sizes and spacing of its root, header, apps, trail, brand and
 * other parts.
 */
export const consoleLayoutTokens = {
  root: {
    background: tokenRef('surface-ground'),
    color: tokenRef('text-primary'),
    minHeight: '100vh',
    viewportHeight: '100vh',
    topOffset: '0px',
    contentPadding: '21px',
    mobileContentPadding: '14px',
  },
  header: {
    height: '56px',
    padding: '8.75px 21px 8.75px 0',
    mobilePaddingEnd: '14px',
    gap: '14px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    zIndex: '20',
  },
  apps: {
    mobilePaddingStart: '14px',
  },
  trail: {
    gap: '10.5px',
    paddingStart: '19.25px',
    alonePaddingStart: '21px',
    mobilePaddingStart: '10.5px',
  },
  brand: {
    gap: '8.75px',
    logoSize: '28px',
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
    mutedColor: tokenRef('text-muted'),
    mutedFontWeight: tokenRef('font-weight-medium'),
  },
  crumb: {
    slashColor: tokenRef('surface-border'),
    slashFontSize: '15.75px',
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
    currentColor: tokenRef('text-primary'),
    currentFontWeight: tokenRef('font-weight-semibold'),
  },
  rail: {
    width: '84px',
    padding: '10.5px 5.25px',
    mobilePadding: '5.25px 7px',
    gap: '3.5px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
  },
  railItem: {
    padding: '7px 3.5px',
    gap: '3.5px',
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-muted'),
    fontSize: '11px',
    lineHeight: '1.25',
    iconSize: '17.5px',
    hoverBackground: tokenRef('surface-hover'),
    hoverColor: tokenRef('text-primary'),
    activeBackground: mix(tokenRef('primary-500'), '14%', 'transparent'),
    activeHoverBackground: mix(tokenRef('primary-500'), '18%', 'transparent'),
    activeColor: tokenRef('primary-base'),
    activeFontWeight: tokenRef('font-weight-semibold'),
    mobileMinWidth: '72px',
    focusRingWidth: '2px',
    focusRingColor: tokenRef('primary-base'),
    focusRingOffset: '2px',
    transitionDuration: '150ms',
  },
  panel: {
    width: '236px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    navPadding: '14px 10.5px',
    mobileNavPadding: '10.5px',
    toggleHeight: '42px',
    togglePadding: '0 14px',
    toggleGap: '8.75px',
    toggleColor: tokenRef('text-primary'),
    toggleIconColor: tokenRef('text-muted'),
    toggleFontSize: '12.25px',
    toggleFontWeight: tokenRef('font-weight-semibold'),
    toggleHoverBackground: tokenRef('surface-hover'),
    collapseDuration: '200ms',
    asideDuration: '420ms',
    asideEasing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    contentDuration: '280ms',
    contentDelay: '60ms',
  },
};

type ConsoleLayoutTokensShape = typeof consoleLayoutTokens;

/** Type of `consoleLayoutTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraConsoleLayoutTokens extends ConsoleLayoutTokensShape {}
