import { fade, lightDark, tokenRef } from './token-helpers';

/** Design tokens of `tx-highlight-text`: colors, sizes and spacing of its mark. */
export const highlightTextTokens = {
  mark: {
    background: lightDark(tokenRef('yellow-200'), fade(tokenRef('yellow-400'), '72%')),
    color: lightDark(tokenRef('surface-950'), tokenRef('yellow-50')),
    borderRadius: '3px',
    paddingX: '1px',
    fontWeight: 'inherit',
  },
};

/** Design tokens of `tx-amount`: colors, sizes and spacing of its root and currency. */
export const amountTokens = {
  root: {
    color: tokenRef('text-primary'),
    fontWeight: tokenRef('font-weight-semibold'),
    strongFontWeight: tokenRef('font-weight-bold'),
    mutedColor: tokenRef('text-muted'),
    mutedFontWeight: tokenRef('font-weight-regular'),
    positiveColor: lightDark(tokenRef('green-700'), tokenRef('green-400')),
    negativeColor: lightDark(tokenRef('red-700'), tokenRef('red-400')),
  },
  currency: {
    color: tokenRef('text-muted'),
    fontSize: '0.85em',
    fontWeight: tokenRef('font-weight-medium'),
  },
};

/** Design tokens of `tx-status-icon`: its colors, sizes and spacing, plus the severity variants. */
export const statusIconTokens = {
  root: {
    size: '16px',
    smSize: '14px',
    lgSize: '20px',
  },
  success: { color: lightDark(tokenRef('green-600'), tokenRef('green-400')) },
  info: { color: lightDark(tokenRef('sky-600'), tokenRef('sky-400')) },
  warn: { color: lightDark(tokenRef('orange-600'), tokenRef('orange-400')) },
  danger: { color: lightDark(tokenRef('red-600'), tokenRef('red-400')) },
  secondary: { color: tokenRef('text-muted') },
};

/** Design tokens of `tx-link`: its colors, sizes and spacing. */
export const linkTokens = {
  root: {
    color: tokenRef('primary-soft-text'),
    hoverColor: tokenRef('primary-active'),
    gap: '6px',
    underlineOffset: '2px',
    externalIconSize: '0.8em',
    copyColor: tokenRef('text-muted'),
    copyHoverColor: tokenRef('primary-soft-text'),
    copyHoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    copySize: '22px',
    copyIconSize: '12px',
    copiedColor: lightDark(tokenRef('green-700'), tokenRef('green-400')),
    focusRingColor: tokenRef('focus-ring-color'),
  },
};

/** Design tokens of `tx-icon-link`: its colors, sizes and spacing. */
export const iconLinkTokens = {
  root: {
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    activeColor: tokenRef('primary-soft-text'),
    gap: '8px',
    paddingX: '8px',
    paddingY: '6px',
    borderRadius: tokenRef('radius-md'),
    hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    activeBackground: tokenRef('highlight-background'),
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-medium'),
    iconSize: '1em',
    focusRingColor: tokenRef('focus-ring-color'),
  },
};

/** Type of `highlightTextTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraHighlightTextTokens = typeof highlightTextTokens;
/** Type of `amountTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraAmountTokens = typeof amountTokens;
/** Type of `statusIconTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraStatusIconTokens = typeof statusIconTokens;
/** Design tokens of `tx-truncate-text`: its colors, sizes and spacing. */
export const truncateTextTokens = {
  root: {
    gap: '8px',
    linkColor: tokenRef('primary-soft-text'),
    linkHoverColor: tokenRef('primary-active'),
    copyColor: 'inherit',
    copyHoverColor: tokenRef('primary-soft-text'),
    copiedColor: lightDark(tokenRef('green-700'), tokenRef('green-400')),
    copyIconSize: tokenRef('font-size-md'),
    focusRingColor: tokenRef('focus-ring-color'),
    transitionDuration: tokenRef('motion-duration'),
  },
};

/** Type of `linkTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraLinkTokens = typeof linkTokens;
/** Type of `truncateTextTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraTruncateTextTokens = typeof truncateTextTokens;
/** Type of `iconLinkTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraIconLinkTokens = typeof iconLinkTokens;
