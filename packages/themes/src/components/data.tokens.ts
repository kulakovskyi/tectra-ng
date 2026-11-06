import { tokenRef } from './token-helpers';

const borderColor = tokenRef('surface-border');

export const dataViewTokens = {
  root: {
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    borderColor,
    borderWidth: '0',
    borderRadius: '0',
    transitionDuration: tokenRef('motion-duration'),
  },
  header: {
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    padding: '8.75px 12.25px',
    borderRadius: '0',
  },
  footer: {
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    padding: '8.75px 12.25px',
    borderRadius: '0',
  },
  empty: {
    padding: '10.5px 12.25px',
    color: tokenRef('text-muted'),
  },
  loading: {
    blur: '8px',
    background: 'transparent',
  },
  layoutSwitch: {
    gap: '0',
  },
};

export type TectraDataViewTokens = typeof dataViewTokens;

export const virtualScrollerTokens = {
  root: {
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '-2px',
  },
  loader: {
    background: tokenRef('surface-card'),
    color: tokenRef('text-muted'),
    iconSize: '24.5px',
  },
};

export type TectraVirtualScrollerTokens = typeof virtualScrollerTokens;

export const timelineTokens = {
  event: {
    minHeight: '63px',
  },
  horizontal: {
    eventContentPadding: '12.25px 0',
  },
  vertical: {
    eventContentPadding: '0 12.25px',
  },
  eventMarker: {
    size: '14px',
    borderRadius: '50%',
    borderWidth: '2px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    contentBorderRadius: '50%',
    contentSize: '6px',
    contentBackground: tokenRef('primary-base'),
    contentInsetShadow: '0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)',
  },
  eventConnector: {
    color: tokenRef('surface-border'),
    size: '2px',
  },
};

export type TectraTimelineTokens = typeof timelineTokens;
