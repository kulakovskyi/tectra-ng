import { TxAmountFormatOptions, TxAmountSegment } from './amount.types';

const DIGITS_INFO = /^(\d+)?(?:\.(\d+))?(?:-(\d+))?$/;

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

export function formatAmount(amount: number, options: TxAmountFormatOptions): TxAmountSegment[] {
  const base: Intl.NumberFormatOptions = {
    ...parseDigitsInfo(options.format),
    notation: options.notation ?? 'standard',
    signDisplay: options.showSign ? 'exceptZero' : 'auto',
  };
  const currency = options.currency?.trim();
  if (currency) {
    try {
      return toSegments(
        new Intl.NumberFormat(options.locale, { ...base, style: 'currency', currency, currencyDisplay: options.currencyDisplay ?? 'narrowSymbol' }).formatToParts(amount),
      );
    } catch {
      return [...toSegments(new Intl.NumberFormat(options.locale, base).formatToParts(amount)), { text: ' ', currency: false }, { text: currency, currency: true }];
    }
  }
  return toSegments(new Intl.NumberFormat(options.locale, base).formatToParts(amount));
}
