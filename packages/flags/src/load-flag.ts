import { TX_FLAG_CIRCLES, TX_FLAG_CODES, TX_FLAG_RECTANGLES, TxFlagCode } from './generated/flag-loaders';

export type TxFlagSetShape = 'rectangle' | 'circle';

const cache = new Map<string, Promise<string | null>>();
const known = new Set<string>(TX_FLAG_CODES);

export function isTxFlagCode(code: string): code is TxFlagCode {
  return known.has(code.toLowerCase());
}

export function loadTxFlagSvg(code: string, shape: TxFlagSetShape = 'rectangle'): Promise<string | null> {
  const key = code.toLowerCase();
  if (!isTxFlagCode(key)) {
    return Promise.resolve(null);
  }
  return (shape === 'circle' ? TX_FLAG_CIRCLES : TX_FLAG_RECTANGLES)[key]().then((module) => module.default);
}

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
