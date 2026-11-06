import { lightDark, tokenRef } from './token-helpers';

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

export const statTilesTokens = {
  root: {
    gap: '14px',
    minWidth: '168px',
    floorWidth: '210px',
  },
  compact: {
    gap: '7px',
  },
};

export type TectraStatTilesTokens = typeof statTilesTokens;

export const statTileTokens = {
  root: {
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    borderWidth: '1px',
    borderRadius: tokenRef('radius-lg'),
    paddingX: '17.5px',
    paddingY: '14px',
    gap: '10.5px',
    headGap: '14px',
    mainGap: '3.5px',
    transitionDuration: tokenRef('motion-duration'),
  },
  compact: {
    paddingX: '12.25px',
    paddingY: '8.75px',
    gap: '7px',
    iconSize: '28px',
    valueFontSize: '17.5px',
  },
  icon: {
    size: '38.5px',
    fontSize: '15.75px',
    borderRadius: tokenRef('radius-md'),
    backgroundMix: '12%',
  },
  label: {
    color: tokenRef('text-muted'),
    fontSize: '11.375px',
    fontWeight: tokenRef('font-weight-medium'),
  },
  value: {
    color: tokenRef('text-primary'),
    fontSize: '24.5px',
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1',
    letterSpacing: '-0.03em',
    textFontSize: '17.5px',
    textLineHeight: '24.5px',
    fitMinFontSize: '14px',
    fitFontSize: '8cqi',
    fitMaxFontSize: '24.5px',
  },
  unit: {
    color: tokenRef('text-muted'),
    fontSize: '12.25px',
    lineHeight: '17.5px',
    fontWeight: tokenRef('font-weight-medium'),
    gap: '3.5px',
  },
  meta: {
    color: tokenRef('text-muted'),
    fontSize: '10.5px',
    lineHeight: '14px',
  },
  bar: {
    height: '3.5px',
    marginTop: '3.5px',
    borderRadius: tokenRef('radius-full'),
    background: tokenRef('surface-ground'),
    transitionDuration: '0.5s',
  },
  highlighted: {
    backgroundMix: '8%',
    borderMix: '30%',
  },
  link: {
    hoverBorderColor: tokenRef('primary-base'),
    focusRingWidth: '2px',
    focusRingColor: tokenRef('primary-base'),
  },
  tone: {
    neutral: tokenRef('text-muted'),
    primary: tokenRef('primary-base'),
    success: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    info: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    warn: lightDark(tokenRef('amber-600'), tokenRef('amber-400')),
    danger: lightDark(tokenRef('red-600'), tokenRef('red-400')),
  },
};

export type TectraStatTileTokens = typeof statTileTokens;

export const sparklineTokens = {
  root: {
    height: '31.5px',
    strokeWidth: '1.75',
    areaOpacity: '0.1',
  },
  tone: {
    primary: tokenRef('primary-base'),
    info: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    success: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    warn: lightDark(tokenRef('amber-600'), tokenRef('amber-400')),
    danger: lightDark(tokenRef('red-600'), tokenRef('red-400')),
  },
};

export type TectraSparklineTokens = typeof sparklineTokens;
