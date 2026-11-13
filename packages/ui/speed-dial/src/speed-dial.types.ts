/** Direction in which the speed dial items open, straight or diagonal. */
export type TxSpeedDialDirection = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
/**
 * Layout of the speed dial items: in a `linear` row or along a `circle`, `semi-circle` or `quarter-
 * circle`.
 */
export type TxSpeedDialType = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';
/** Parts of `tx-speed-dial` that `pt` can style. */
export type TxSpeedDialPart = 'root' | 'button' | 'list' | 'item' | 'mask';
