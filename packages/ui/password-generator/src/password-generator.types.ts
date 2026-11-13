/** Options of `TxPasswordGenerator.generate`: length and which character sets to use. */
export interface TxPasswordGeneratorOptions {
  /** Number of characters (default 16); never less than the number of enabled character sets. */
  length?: number;
  /** Use the letters a – z (default `true`). */
  lowercase?: boolean;
  /** Use the letters A – Z (default `true`). */
  uppercase?: boolean;
  /** Use the digits 0 – 9 (default `true`). */
  digits?: boolean;
  /** Use symbols like `!@#$%` (default `true`). */
  symbols?: boolean;
  /** Own set of symbols to draw from instead of the default one. */
  symbolSet?: string;
  /** Leaves out characters that look alike: `0 O 1 l I |` (default `false`). */
  excludeSimilar?: boolean;
}
