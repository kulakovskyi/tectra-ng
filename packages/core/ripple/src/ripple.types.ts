/** One running ripple wave. */
export interface TxRippleRef {
  /** Element of the wave. */
  element: HTMLElement;
  /** Whether the wave has finished growing. */
  isEntered: boolean;
  /** Whether the press ended, so the wave can fade out. */
  isReleased: boolean;
  /** Whether the wave was started with the keyboard instead of a pointer. */
  fromKeyboard: boolean;
}
