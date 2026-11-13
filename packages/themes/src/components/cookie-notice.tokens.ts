import { joinCss, mix, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-cookie-notice`: colors, sizes and spacing of its root, icon, body, title, text and
 * other parts.
 */
export const cookieNoticeTokens = {
  root: {
    inset: '14px',
    wideInset: '21px',
    wideWidth: '336px',
    gap: '10.5px',
    padding: '14px',
    borderRadius: tokenRef('radius-xl'),
    background: mix(tokenRef('surface-card'), '84%', 'transparent'),
    backdropFilter: 'blur(24px) saturate(1.5)',
    ringColor: tokenRef('surface-border'),
    shadow: tokenRef('shadow-overlay'),
    zIndex: tokenRef('layer-dropdown'),
  },
  icon: {
    size: '31.5px',
    fontSize: '12.25px',
    background: mix(tokenRef('primary-base'), '14%', 'transparent'),
    color: tokenRef('primary-base'),
  },
  body: {
    gap: '3.5px',
  },
  title: {
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-semibold'),
    color: tokenRef('text-primary'),
  },
  text: {
    fontSize: '11.375px',
    lineHeight: '1.375',
    color: tokenRef('text-muted'),
  },
  actions: {
    gap: '14px',
    marginTop: '7px',
  },
  link: {
    fontSize: '11.375px',
    fontWeight: tokenRef('font-weight-medium'),
    color: tokenRef('primary-base'),
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
  },
  motion: {
    enterDuration: '500ms',
    enterDelay: '600ms',
    enterEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    leaveDuration: '200ms',
  },
};

/** Type of `cookieNoticeTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraCookieNoticeTokens = typeof cookieNoticeTokens;
