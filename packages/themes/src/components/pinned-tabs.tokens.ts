import { joinCss, mix, tokenRef } from './token-helpers';

export const pinnedTabsTokens = {
  root: {
    gap: '7px',
  },
  dialog: {
    gap: '17.5px',
    sectionGap: '8.75px',
    counterColor: tokenRef('text-muted'),
    counterFontSize: '10.5px',
    counterFontWeight: tokenRef('font-weight-medium'),
    optionsGap: '7px',
    optionsMinWidth: '175px',
    optionsMaxHeight: '50vh',
  },
  option: {
    height: '42px',
    padding: '0 10.5px 0 14px',
    gap: '10.5px',
    borderRadius: '10.5px',
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-medium'),
    color: tokenRef('text-primary'),
    background: tokenRef('surface-ground'),
    hoverBackground: tokenRef('surface-hover'),
    hoverRingColor: tokenRef('surface-border'),
    selectedBackground: mix(tokenRef('primary-base'), '12%', 'transparent'),
    selectedRingColor: mix(tokenRef('primary-base'), '55%', 'transparent'),
    selectedHoverBackground: mix(tokenRef('primary-base'), '18%', 'transparent'),
    selectedHoverRingColor: tokenRef('primary-base'),
    activeScale: '0.985',
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
    duration: '150ms',
  },
  check: {
    size: '17.5px',
    ringColor: mix(tokenRef('text-muted'), '45%', 'transparent'),
    iconSize: '8.75px',
    background: tokenRef('primary-base'),
    color: tokenRef('primary-contrast'),
  },
};

export type TectraPinnedTabsTokens = typeof pinnedTabsTokens;
