import { lightDark, mix, tokenRef } from './token-helpers';

const tint = (amount: string) => mix(tokenRef('primary-base'), amount, 'transparent');

export const kanbanTokens = {
  root: {
    gap: '14px',
    paddingBottom: '14px',
    inset: '4px',
    minHeight: '280px',
    columnWidth: '252px',
  },
  column: {
    gap: '10.5px',
    padding: '10.5px',
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('surface-card'),
    shadow: `0 0 0 1px ${lightDark(tokenRef('surface-200'), tokenRef('surface-800'))}`,
    headerGap: '7px',
    headerMinHeight: '28px',
    titleColor: tokenRef('text-primary'),
    titleFontSize: '12.25px',
    titleFontWeight: tokenRef('font-weight-semibold'),
  },
  handle: {
    size: '21px',
    borderRadius: tokenRef('radius-md'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: tokenRef('surface-hover'),
    iconSize: '10.5px',
  },
  list: {
    gap: '7px',
    minHeight: '49px',
    padding: '3.5px',
    receivingBackground: tint('5%'),
    scrollbarColor: tokenRef('surface-border'),
  },
  placeholder: {
    minHeight: '56px',
    borderColor: tint('45%'),
    background: tint('6%'),
  },
  empty: {
    minHeight: '49px',
    padding: '0 10.5px',
    fontSize: '10.5px',
    color: tokenRef('text-muted'),
    borderColor: tokenRef('surface-border'),
  },
  card: {
    borderRadius: tokenRef('radius-lg'),
    dragShadow: tokenRef('shadow-overlay'),
    focusRingShadow: `0 0 0 2px ${tokenRef('surface-card')}, 0 0 0 4px ${tokenRef('focus-ring-color')}`,
  },
  motion: {
    duration: '200ms',
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    fadeDuration: '150ms',
  },
};

export type TectraKanbanTokens = typeof kanbanTokens;
