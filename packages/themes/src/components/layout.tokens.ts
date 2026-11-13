import { fade, joinCss, lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-divider`: its colors, sizes and spacing. */
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

/** Design tokens of `tx-card`: its colors, sizes and spacing. */
export const cardTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderRadius: '16px',
    shadow: joinCss('0 1px 2px ', fade(tokenRef('surface-950'), '95%')),
    padding: '20px',
    gap: '12px',
    color: tokenRef('text-primary'),
    titleFontSize: tokenRef('font-size-xl'),
    titleFontWeight: tokenRef('font-weight-semibold'),
    subtitleColor: tokenRef('text-muted'),
    subtitleFontSize: tokenRef('font-size-md'),
  },
};

/** Design tokens of `tx-panel`: colors, sizes and spacing of its root, inset and plain. */
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

/** Design tokens of `tx-fieldset`: its colors, sizes and spacing. */
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

type DividerTokensShape = typeof dividerTokens;

/** Type of `dividerTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraDividerTokens extends DividerTokensShape {}
type CardTokensShape = typeof cardTokens;

/** Type of `cardTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCardTokens extends CardTokensShape {}
type PanelTokensShape = typeof panelTokens;

/** Type of `panelTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraPanelTokens extends PanelTokensShape {}
type FieldsetTokensShape = typeof fieldsetTokens;

/** Type of `fieldsetTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraFieldsetTokens extends FieldsetTokensShape {}
