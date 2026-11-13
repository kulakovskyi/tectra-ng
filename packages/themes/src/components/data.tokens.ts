import { lightDark, tokenRef } from './token-helpers';

const borderColor = tokenRef('surface-border');

/**
 * Design tokens of `tx-data-view`: colors, sizes and spacing of its root, header, footer, empty, loading and
 * other parts.
 */
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

type DataViewTokensShape = typeof dataViewTokens;

/** Type of `dataViewTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraDataViewTokens extends DataViewTokensShape {}

/** Design tokens of `tx-virtual-scroller`: colors, sizes and spacing of its root and loader. */
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

type VirtualScrollerTokensShape = typeof virtualScrollerTokens;

/** Type of `virtualScrollerTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraVirtualScrollerTokens extends VirtualScrollerTokensShape {}

/**
 * Design tokens of `tx-timeline`: colors, sizes and spacing of its event, horizontal, vertical, event marker
 * and event connector.
 */
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

type TimelineTokensShape = typeof timelineTokens;

/** Type of `timelineTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraTimelineTokens extends TimelineTokensShape {}

/** Design tokens of `tx-stat-tiles`: its colors, sizes and spacing, plus the `compact` size. */
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

type StatTilesTokensShape = typeof statTilesTokens;

/** Type of `statTilesTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraStatTilesTokens extends StatTilesTokensShape {}

/**
 * Design tokens of `tx-stat-tile`: colors, sizes and spacing of its root, icon, label, value, unit and other
 * parts, plus the `compact` size and the tone variants.
 */
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

type StatTileTokensShape = typeof statTileTokens;

/** Type of `statTileTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraStatTileTokens extends StatTileTokensShape {}

/** Design tokens of `tx-sparkline`: its colors, sizes and spacing, plus the tone variants. */
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

type SparklineTokensShape = typeof sparklineTokens;

/** Type of `sparklineTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraSparklineTokens extends SparklineTokensShape {}

/** Design tokens of `tx-countdown`: its colors, sizes and spacing. */
export const countdownTokens = {
  root: {
    color: 'inherit',
    fontWeight: 'inherit',
    endingColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    expiredColor: 'inherit',
    transitionDuration: tokenRef('motion-duration'),
  },
};

type CountdownTokensShape = typeof countdownTokens;

/** Type of `countdownTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCountdownTokens extends CountdownTokensShape {}

/**
 * Design tokens of `tx-analog-clock`: colors, sizes and spacing of its root, tick, hour hand, minute hand,
 * second hand and other parts.
 */
export const analogClockTokens = {
  root: {
    size: '210px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transitionDuration: '700ms',
    transitionEasing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  tick: {
    width: '3.5px',
    height: '4%',
    offset: '-1125%',
    color: tokenRef('surface-border'),
    majorHeight: '7%',
    majorOffset: '-600%',
    majorColor: tokenRef('text-muted'),
  },
  hourHand: {
    width: '5.25px',
    length: '27%',
    color: tokenRef('text-primary'),
  },
  minuteHand: {
    width: '3.5px',
    length: '40%',
    color: tokenRef('primary-base'),
  },
  secondHand: {
    width: '1.75px',
    length: '42%',
    color: lightDark(tokenRef('red-600'), tokenRef('red-400')),
  },
  pin: {
    size: '14px',
    color: tokenRef('primary-base'),
    ringWidth: '4px',
    ringColor: tokenRef('surface-card'),
  },
};

type AnalogClockTokensShape = typeof analogClockTokens;

/** Type of `analogClockTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraAnalogClockTokens extends AnalogClockTokensShape {}
