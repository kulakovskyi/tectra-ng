/**
 * Frame of `tx-empty-state`: `plain` without one, `framed` as a card for a whole page, `inset` as a
 * block inside a card.
 */
export type TxEmptyStateVariant = 'plain' | 'framed' | 'inset';

/** Size of `tx-empty-state`: `compact` (one row), `normal` or `large` for onboarding. */
export type TxEmptyStateSize = 'compact' | 'normal' | 'large';

/** Colour of the icon of `tx-empty-state`. */
export type TxEmptyStateTone = 'neutral' | 'primary' | 'success' | 'info' | 'warn' | 'danger';

/** Names of the parts of `tx-empty-state` that its `pt` input can style. */
export type TxEmptyStatePart = 'root' | 'icon' | 'body' | 'title' | 'text';
