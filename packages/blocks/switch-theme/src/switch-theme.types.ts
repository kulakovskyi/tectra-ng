/** Names of the parts of `tx-switch-theme` that its `pt` input can style. */
export type TxSwitchThemePart = 'root' | 'button' | 'icon';

/** Point where the theme reveal circle starts, in px from the top left of the window. */
export interface TxThemeRevealOrigin {
  /** Distance from the left edge. */
  x: number;
  /** Distance from the top edge. */
  y: number;
}
