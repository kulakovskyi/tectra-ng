/** Size of a country flag: `small` follows the text, `medium` or `large`. */
export type TxCountrySize = 'small' | 'medium' | 'large';
/** Outline of a flag: `rectangle` or `circle`. */
export type TxFlagShape = 'rectangle' | 'circle';
/** Names of the parts of `tx-country` that `pt` can style. */
export type TxCountryPart = 'root' | 'flag' | 'name';

/** What draws one flag: an image address, or CSS classes of a flag stylesheet. */
export interface TxFlag {
  /** CSS classes put on the flag element. */
  class?: string;
  /** Address of the flag image. */
  src?: string;
}

/**
 * Turns a country code and a shape into a flag image or CSS classes, now or as a promise; `null` falls back to the emoji flag.
 */
export type TxFlagResolver = (code: string, shape: TxFlagShape) => TxFlag | Promise<TxFlag | null> | null;
