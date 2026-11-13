/** Colour of the icon of a `tx-stat-tile`: `neutral`, `primary` or a severity. */
export type TxStatTileTone = 'neutral' | 'primary' | 'success' | 'info' | 'warn' | 'danger';
/** Parts of `tx-stat-tiles` that `pt` can style. */
export type TxStatTilesPart = 'root';
/** Parts of `tx-stat-tile` that `pt` can style. */
export type TxStatTilePart = 'root' | 'body' | 'head' | 'icon' | 'main' | 'label' | 'value' | 'unit' | 'meta' | 'aside' | 'bar' | 'barFill';
/** Router link of a stat tile: a path or a list of commands. */
export type TxStatTileCommands = string | readonly unknown[] | null | undefined;
