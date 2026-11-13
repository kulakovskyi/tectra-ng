import { lightDark, mix, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-network-status`: colors, sizes and spacing of its root, icon, offline, restored and
 * motion.
 */
export const networkStatusTokens = {
  root: {
    bottom: '21px',
    zIndex: tokenRef('layer-tooltip'),
    gap: '8.75px',
    padding: '7px 14px 7px 7px',
    borderRadius: tokenRef('radius-full'),
    fontSize: '12.25px',
    fontWeight: tokenRef('font-weight-medium'),
    color: tokenRef('text-primary'),
    background: mix(tokenRef('surface-card'), '88%', 'transparent'),
    backdropFilter: 'blur(24px) saturate(1.5)',
    ringColor: tokenRef('surface-border'),
    shadow: tokenRef('shadow-overlay'),
  },
  icon: {
    size: '24.5px',
    fontSize: '12.25px',
    tint: '14%',
  },
  offline: {
    color: lightDark(tokenRef('amber-600'), tokenRef('amber-400')),
  },
  restored: {
    color: lightDark(tokenRef('green-600'), tokenRef('green-400')),
  },
  motion: {
    enterDuration: '450ms',
    enterEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    leaveDuration: '300ms',
  },
};

/** Type of `networkStatusTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraNetworkStatusTokens = typeof networkStatusTokens;
