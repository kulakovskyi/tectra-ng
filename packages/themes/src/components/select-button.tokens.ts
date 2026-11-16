import { lightDark, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-select-button`: the track (same look as the segmented `tx-tabs`), its items in every size,
 * the selected item and the pop when an item gets selected.
 */
export const selectButtonTokens = {
  root: {
    gap: '3.5px',
    padding: '3.5px',
    borderWidth: '1px',
    borderColor: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    borderRadius: '10.5px',
    background: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
    invalidBorderColor: tokenRef('danger-base'),
    disabledOpacity: '0.6',
    transitionDuration: '0.2s',
    focusRing: { width: '2px', color: tokenRef('focus-ring-color'), offset: '1px' },
    sm: { gap: '1.75px', padding: '1.75px', borderRadius: '7px' },
    lg: { gap: '3.5px', padding: '3.5px', borderRadius: '12.25px' },
  },
  item: {
    padding: '8.75px 10.5px',
    iconOnlyPadding: '8.75px',
    gap: '7px',
    borderRadius: '7px',
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.25',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
    activeBackground: tokenRef('primary-base'),
    activeColor: tokenRef('primary-contrast'),
    activeShadow: 'none',
    sm: { padding: '5.25px 7px', iconOnlyPadding: '5.25px', gap: '3.5px', fontSize: '12.25px', borderRadius: '5.25px' },
    lg: { padding: '10.5px 14px', iconOnlyPadding: '10.5px', gap: '8.75px', fontSize: tokenRef('font-size-lg'), borderRadius: '8.75px' },
  },
  activate: {
    scale: '0.94',
    duration: '220ms',
    easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)',
  },
};

type SelectButtonTokensShape = typeof selectButtonTokens;

/** Type of `selectButtonTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraSelectButtonTokens extends SelectButtonTokensShape {}
