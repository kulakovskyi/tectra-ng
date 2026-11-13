/** One shape of an icon on a 24×24 grid: an SVG path `d` drawn as a stroke, or an object for a filled path, no stroke or a transform. */
export type TxIconPath = string | { d: string; fill?: true; stroke?: false; transform?: string };

/** Icons by name, as `provideTxIcons` takes them, e.g. `{ plus: txIconPlus }`. */
export type TxIconSet = Record<string, TxIconPath[]>;
