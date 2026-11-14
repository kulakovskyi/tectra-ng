/** Options of `formatBytes`. */
export interface TxFormatBytesOptions {
  /** Locale of the number and the unit names (default `en-US`). */
  locale?: string;
  /** Maximum digits after the point for sizes of a kilobyte and more (default 1). */
  decimals?: number;
  /** Size of a unit: `1024` (default) or `1000`. */
  base?: 1000 | 1024;
}

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'] as const;

/** Formats a byte count in the largest unit that fits, with `Intl.NumberFormat` unit names of the locale: `512 byte`, `1.5 kB`, `5 MB`. */
export function formatBytes(bytes: number, options: TxFormatBytesOptions = {}): string {
  const { locale = 'en-US', decimals = 1, base = 1024 } = options;
  const size = Math.max(0, bytes);
  const exponent = size < base ? 0 : Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(size) / Math.log(base)));
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: BYTE_UNITS[exponent],
    unitDisplay: 'short',
    maximumFractionDigits: exponent === 0 ? 0 : decimals,
  }).format(size / base ** exponent);
}
