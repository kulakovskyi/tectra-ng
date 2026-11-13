import { fade, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-popover`: colors, sizes and spacing of its root, header, title, content, footer and
 * other parts.
 */
export const popoverTokens = {
  root: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    borderWidth: '1px',
    borderRadius: tokenRef('radius-lg'),
    color: tokenRef('text-primary'),
    shadow: tokenRef('shadow-overlay'),
    minWidth: '0',
    maxWidth: 'calc(100vw - 16px)',
    padding: '0',
    gap: '0',
    fontSize: tokenRef('font-size-md'),
  },
  header: {
    padding: '10.5px 10.5px 0',
    gap: '7px',
  },
  title: {
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  content: {
    padding: '10.5px',
  },
  footer: {
    padding: '0 10.5px 10.5px',
    gap: '5.25px',
  },
  closeButton: {
    size: '30px',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: fade(tokenRef('text-primary'), '92%'),
    borderRadius: tokenRef('radius-md'),
  },
  arrow: {
    size: '14px',
    inset: '15.75px',
  },
  focusRing: {
    width: '2px',
    color: tokenRef('focus-ring-color'),
  },
};

type PopoverTokensShape = typeof popoverTokens;

/** Type of `popoverTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraPopoverTokens extends PopoverTokensShape {}
