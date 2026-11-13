import { TX_FLAG_CIRCLES, TX_FLAG_CODES, TX_FLAG_RECTANGLES, TxFlagCode } from './generated/flag-loaders';

/** Shape of a flag: `rectangle` (4:3) or `circle`. */
export type TxFlagSetShape = 'rectangle' | 'circle';

const cache = new Map<string, Promise<string | null>>();
const known = new Set<string>(TX_FLAG_CODES);

/** Whether a country code (any case) has a flag in the set. */
export function isTxFlagCode(code: string): code is TxFlagCode {
  return known.has(code.toLowerCase());
}

/** Loads the SVG markup of a flag, or `null` for an unknown code; each flag is its own lazy chunk. */
export function loadTxFlagSvg(code: string, shape: TxFlagSetShape = 'rectangle'): Promise<string | null> {
  const key = code.toLowerCase();
  if (!isTxFlagCode(key)) {
    return Promise.resolve(null);
  }
  return (shape === 'circle' ? TX_FLAG_CIRCLES : TX_FLAG_RECTANGLES)[key]().then((module) => module.default);
}

/** Loads a flag as a `data:` URL for an `img`, or `null` for an unknown code; cached per code and shape. */
export function loadTxFlag(code: string, shape: TxFlagSetShape = 'rectangle'): Promise<string | null> {
  const key = `${shape}:${code.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const loading = loadTxFlagSvg(code, shape).then((svg) => (svg ? `data:image/svg+xml,${encodeURIComponent(svg)}` : null));
  cache.set(key, loading);
  loading.catch(() => cache.delete(key));
  return loading;
}
