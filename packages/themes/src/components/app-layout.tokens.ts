import { ACCENT_PALETTES } from '@tectra-ng/tokens';
import { joinCss, mix, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function cyan400(): string {
  return ACCENT_PALETTES.cyan[400];
}

const ground = tokenRef('surface-ground');
/* @__NO_SIDE_EFFECTS__ */
const tint = (color: string, amount: string) => mix(color, amount, ground);

/**
 * Design tokens of `tx-app-layout`: colors, sizes and spacing of its root, topbar, menu button, plain,
 * sidebar and other parts.
 */
export const appLayoutTokens = {
  root: {
    background: ground,
    color: tokenRef('text-primary'),
    minHeight: '100vh',
    viewportHeight: '100vh',
    topOffset: '0px',
  },
  topbar: {
    minHeight: '56px',
    padding: '10.5px 16.1px 10.5px 0',
    mobilePaddingStart: '16.1px',
    gap: '14px',
    background: 'transparent',
  },
  menuButton: {
    size: '35px',
    borderRadius: tokenRef('radius-md'),
    iconSize: '17.5px',
    color: tokenRef('text-primary'),
    hoverBackground: tokenRef('surface-hover'),
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
    marginEnd: '21px',
  },
  plain: {
    padding: '10.5px 21px',
    brandGap: '8.75px',
    logoSize: '28px',
    nameFontSize: '17.5px',
    nameFontWeight: tokenRef('font-weight-semibold'),
    nameLineHeight: '28px',
    color: tokenRef('text-primary'),
  },
  sidebar: {
    width: '224px',
    railWidth: '73.5px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    zIndex: '999',
    duration: '0.3s',
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    headerHeight: '56px',
    headerPadding: '0 17.5px 0 21px',
    logoSize: '24.5px',
    brandGap: '8.75px',
    nameColor: tokenRef('text-primary'),
    nameFontSize: '14.875px',
    nameFontWeight: tokenRef('font-weight-bold'),
    nameLetterSpacing: '-0.02em',
    nameRevealDuration: '0.3s',
    nameHideDuration: '0.1s',
    pinSize: '28px',
    pinBorderRadius: tokenRef('radius-md'),
    pinIconSize: '14px',
    pinColor: tokenRef('text-muted'),
    pinHoverColor: tokenRef('text-primary'),
    pinHoverBackground: tokenRef('surface-hover'),
    pinSwapDuration: '0.2s',
    menuPadding: '7px 0 28px',
    menuItemInset: '10.5px',
    scrollbarColor: tokenRef('surface-border'),
  },
  mask: {
    background: tokenRef('mask-background'),
    zIndex: '998',
  },
  content: {
    padding: '21px 28px 14px',
    mobilePadding: '14px',
    maxWidth: '1504px',
  },
  backdrop: {
    spectrum: joinCss('linear-gradient(120deg, ', tint(tokenRef('primary-400'), '14%'), ' 0%, ', ground, ' 32%, ', tint(tokenRef('purple-400'), '11%'), ' 58%, ', ground, ' 78%, ', tint(cyan400(), '13%'), ' 100%)'),
    accent: joinCss('linear-gradient(120deg, ', tint(tokenRef('primary-400'), '15%'), ' 0%, ', ground, ' 30%, ', tint(tokenRef('primary-300'), '12%'), ' 56%, ', ground, ' 78%, ', tint(tokenRef('primary-600'), '13%'), ' 100%)'),
    noiseOpacity: '0.4',
    noiseSize: '160px',
  },
};

type AppLayoutTokensShape = typeof appLayoutTokens;

/** Type of `appLayoutTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraAppLayoutTokens extends AppLayoutTokensShape {}
