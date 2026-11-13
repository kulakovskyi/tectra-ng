import { tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-page-header`: colors, sizes and spacing of its root, heading, title, subtitle, actions
 * and other parts.
 */
export const pageHeaderTokens = {
  root: {
    gap: '14px',
  },
  heading: {
    gap: '1.75px',
  },
  title: {
    color: tokenRef('text-primary'),
    fontSize: '17.5px',
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.25',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
    lineHeight: '17.5px',
  },
  actions: {
    gap: '7px',
  },
  secondaryButton: {
    background: tokenRef('surface-card'),
    hoverBackground: tokenRef('surface-hover'),
    activeBackground: tokenRef('surface-hover'),
    borderColor: tokenRef('surface-border'),
  },
};

type PageHeaderTokensShape = typeof pageHeaderTokens;

/** Type of `pageHeaderTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraPageHeaderTokens extends PageHeaderTokensShape {}
