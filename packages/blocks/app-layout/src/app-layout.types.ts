/**
 * Look of the backdrop of `tx-app-layout`: `spectrum` (primary, purple and cyan tints) or `accent`
 * (primary tints only).
 */
export type TxAppLayoutBackdrop = 'spectrum' | 'accent';

/** What the layout breakpoint measures: the `viewport` (window) or the `container` (the layout itself). */
export type TxAppLayoutResponsive = 'viewport' | 'container';

/** Names of the parts of `tx-app-layout` that its `pt` input can style. */
export type TxAppLayoutPart = 'root' | 'sidebar' | 'brand' | 'menu' | 'topbar' | 'menuButton' | 'content' | 'mask';
