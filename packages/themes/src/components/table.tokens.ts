import { joinCss, lightDark, mix, tokenRef } from './token-helpers';

const borderColor = tokenRef('surface-border');

/**
 * Design tokens of `tx-table`: colors, sizes and spacing of its root, toolbar, scroller, header cell, sort
 * icon and other parts.
 */
export const tableTokens = {
  root: {
    borderColor,
    transitionDuration: tokenRef('motion-duration'),
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    lineHeight: '1.45',
  },
  toolbar: {
    gap: '10.5px',
    marginBottom: '10.5px',
  },
  scroller: {
    paddingBottom: '10px',
    scrollbarSize: '10px',
    scrollbarThumb: tokenRef('surface-300'),
    scrollbarThumbHover: tokenRef('surface-400'),
  },
  headerCell: {
    background: lightDark(tokenRef('surface-50'), tokenRef('surface-950')),
    color: tokenRef('text-primary'),
    padding: '8.75px 12.25px',
    fontSize: '11.375px',
    fontWeight: tokenRef('font-weight-semibold'),
    gap: '7px',
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '2px', shadow: 'none' },
    sm: { padding: '1.75px 5.25px' },
    lg: { padding: '10.5px 15.75px' },
  },
  sortIcon: {
    size: '11.375px',
    color: 'currentColor',
    badgeSize: '15.75px',
    badgeFontSize: '10.5px',
    badgeBackground: tokenRef('highlight-background'),
    badgeColor: tokenRef('highlight-color'),
  },
  row: {
    background: tokenRef('surface-card'),
    hoverBackground: tokenRef('surface-hover'),
    color: tokenRef('text-primary'),
    stripedBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-950')),
    selectedBackground: tokenRef('highlight-background'),
    selectedColor: tokenRef('highlight-color'),
    menuBackground: mix(tokenRef('primary-base'), '8%', tokenRef('surface-card')),
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '-2px', shadow: 'none' },
  },
  bodyCell: {
    padding: '8.75px 12.25px',
    height: '50px',
    selectedBorderColor: lightDark(tokenRef('primary-100'), tokenRef('primary-900')),
    sm: { padding: '1.75px 5.25px', height: 'auto' },
    lg: { padding: '10.5px 15.75px', height: '50px' },
  },
  footerCell: {
    background: tokenRef('surface-card'),
    color: tokenRef('text-primary'),
    padding: '8.75px 12.25px',
    fontWeight: tokenRef('font-weight-semibold'),
  },
  frozenColumn: {
    shadow: 'none',
  },
  columnResizer: {
    width: '8px',
    lineWidth: '2px',
    color: tokenRef('primary-base'),
  },
  dropPoint: {
    color: tokenRef('primary-base'),
    background: mix(tokenRef('primary-base'), '5%', 'transparent'),
    hoverBackground: mix(tokenRef('primary-base'), '10%', 'transparent'),
  },
  dragPreview: {
    background: tokenRef('surface-card'),
    borderColor,
    borderRadius: tokenRef('radius-md'),
    shadow: tokenRef('shadow-overlay'),
  },
  loading: {
    blur: '8px',
    background: 'transparent',
  },
  empty: {
    padding: '10.5px',
    color: tokenRef('text-primary'),
  },
  filter: {
    gap: '7px',
    minWidth: '175px',
    buttonInset: '7px',
    cellPadding: '7px 12.25px',
  },
  group: {
    background: lightDark(tokenRef('surface-50'), tokenRef('surface-950')),
    fontWeight: tokenRef('font-weight-semibold'),
  },
  editor: {
    paddingBlock: '0',
  },
  expansion: {
    duration: joinCss('calc(', tokenRef('motion-duration'), ' * 1.6)'),
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  grip: {
    size: '10.5px',
    color: tokenRef('text-muted'),
  },
  rowToggleButton: {
    size: '21px',
    borderRadius: '50%',
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: tokenRef('surface-hover'),
    focusRing: { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '2px', shadow: 'none' },
  },
  paginator: {
    marginTop: '14px',
  },
  settings: {
    width: '224px',
    padding: '10.5px',
    gap: '7px',
    maxHeight: '252px',
    titleGap: '7px',
    titleFontWeight: tokenRef('font-weight-semibold'),
    itemPadding: '3.5px',
    itemRadius: tokenRef('radius-xs'),
    itemHoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    handleColor: tokenRef('surface-400'),
    handleSize: '10.5px',
  },
  actions: {
    gap: '7px',
    overflowPadding: '10.5px',
  },
  card: {
    minWidth: '280px',
    gap: '10.5px',
    borderRadius: '10.5px',
    background: tokenRef('surface-card'),
    borderColor,
    fieldPadding: '7px 14px',
    fieldGap: '10.5px',
    fieldFontSize: '12.25px',
    labelFontSize: '10.5px',
    labelColor: tokenRef('text-muted'),
    titlePadding: '10.5px 14px 8.75px',
    titleFontSize: '13.125px',
    titleFontWeight: tokenRef('font-weight-semibold'),
    selectInset: '10.5px',
    actionsPadding: '8.75px 10.5px',
  },
};

type TableTokensShape = typeof tableTokens;

/** Type of `tableTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraTableTokens extends TableTokensShape {}
