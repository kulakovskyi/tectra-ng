import { fade, lightDark, tokenRef } from './token-helpers';

export const dividerTokens = {
  root: {
    color: tokenRef('surface-border'),
    width: '1px',
    margin: '16px',
    contentGap: '12px',
    contentColor: tokenRef('text-muted'),
    contentFontSize: tokenRef('font-size-sm'),
    contentFontWeight: tokenRef('font-weight-medium'),
  },
};

export const cardTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: '16px',
    shadow: `0 1px 2px ${fade(tokenRef('surface-950'), '95%')}`,
    padding: '20px',
    gap: '12px',
    color: tokenRef('text-primary'),
    titleFontSize: tokenRef('font-size-xl'),
    titleFontWeight: tokenRef('font-weight-semibold'),
    subtitleColor: tokenRef('text-muted'),
    subtitleFontSize: tokenRef('font-size-md'),
  },
};

export const panelTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: '16px',
    padding: '24px',
    gap: '20px',
    color: tokenRef('text-primary'),
    titleFontSize: tokenRef('font-size-lg'),
    titleFontWeight: tokenRef('font-weight-semibold'),
    subtitleColor: tokenRef('text-muted'),
    subtitleFontSize: tokenRef('font-size-sm'),
    iconSize: '40px',
    iconBorderRadius: tokenRef('radius-lg'),
    iconColor: tokenRef('primary-base'),
    iconBackground: fade(tokenRef('primary-base'), '88%'),
    transitionDuration: '0.25s',
  },
  inset: {
    background: lightDark(tokenRef('surface-50'), tokenRef('surface-950')),
    padding: '20px',
    gap: '16px',
  },
  plain: {
    gap: '12px',
    titleFontSize: '15px',
    iconSize: '28px',
  },
};

export const fieldsetTokens = {
  root: {
    borderColor: tokenRef('surface-border'),
    borderRadius: '12px',
    padding: '16px 20px 20px',
    background: tokenRef('surface-card'),
    legendPadding: '0 8px',
    legendColor: tokenRef('text-primary'),
    legendFontSize: tokenRef('font-size-md'),
    legendFontWeight: tokenRef('font-weight-semibold'),
    legendHoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    legendFocusBackground: 'transparent',
    legendBackground: 'transparent',
    legendBorderColor: 'transparent',
    legendBorderRadius: tokenRef('radius-md'),
    togglePadding: '4px 8px',
    focusRingWidth: '2px',
    focusRingOffset: '1px',
    focusRingShadow: 'none',
    transitionDuration: '0.25s',
  },
};

export type TectraDividerTokens = typeof dividerTokens;
export type TectraCardTokens = typeof cardTokens;
export type TectraPanelTokens = typeof panelTokens;
export type TectraFieldsetTokens = typeof fieldsetTokens;
