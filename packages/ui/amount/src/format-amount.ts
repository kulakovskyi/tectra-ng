import { TxAmountFormatOptions, TxAmountSegment } from './amount.types';

const DIGITS_INFO = /^(\d+)?(?:\.(\d+))?(?:-(\d+))?$/;
const DEFAULT_FORMAT = '1.0-2';

/**
 * Reads a digits-info string like `1.2-2` (integer digits, minimum and maximum fraction digits) into number format options; an invalid string gives no options.
 */
export function parseDigitsInfo(format: string | undefined): Pick<Intl.NumberFormatOptions, 'minimumIntegerDigits' | 'minimumFractionDigits' | 'maximumFractionDigits'> {
  const match = DIGITS_INFO.exec((format ?? '').trim());
  if (!match) {
    return {};
  }
  const [, integer, minFraction, maxFraction] = match;
  const minimumFractionDigits = minFraction === undefined ? undefined : Number(minFraction);
  const maximumFractionDigits = maxFraction === undefined ? minimumFractionDigits : Math.max(Number(maxFraction), minimumFractionDigits ?? 0);
  return {
    ...(integer === undefined ? {} : { minimumIntegerDigits: Math.max(1, Number(integer)) }),
    ...(minimumFractionDigits === undefined ? {} : { minimumFractionDigits }),
    ...(maximumFractionDigits === undefined ? {} : { maximumFractionDigits }),
  };
}

function toSegments(parts: Intl.NumberFormatPart[]): TxAmountSegment[] {
  const segments: TxAmountSegment[] = [];
  for (const part of parts) {
    const currency = part.type === 'currency';
    const last = segments[segments.length - 1];
    if (last && last.currency === currency) {
      last.text += part.value;
    } else {
      segments.push({ text: part.value, currency });
    }
  }
  return segments;
}

/**
 * Formats a number as money in the given locale and currency and splits the result into currency and number segments.
 */
export function formatAmount(amount: number, options: TxAmountFormatOptions): TxAmountSegment[] {
  const currency = options.currency?.trim();
  const base = (format: string | undefined): Intl.NumberFormatOptions => ({
    ...parseDigitsInfo(format),
    notation: options.notation ?? 'standard',
    signDisplay: options.showSign ? 'exceptZero' : 'auto',
  });
  const plain = base(options.format ?? DEFAULT_FORMAT);
  if (currency) {
    try {
      return toSegments(
        new Intl.NumberFormat(options.locale, { ...base(options.format), style: 'currency', currency, currencyDisplay: options.currencyDisplay ?? 'narrowSymbol' }).formatToParts(amount),
      );
    } catch {
      return [...toSegments(new Intl.NumberFormat(options.locale, plain).formatToParts(amount)), { text: ' ', currency: false }, { text: currency, currency: true }];
    }
  }
  return toSegments(new Intl.NumberFormat(options.locale, plain).formatToParts(amount));
}
