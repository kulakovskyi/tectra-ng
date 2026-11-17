import { TxAmountFormatOptions, TxAmountSegment, TxAmountSymbolPosition, TxAmountSymbols } from './amount.types';

const DIGITS_INFO = /^(\d+)?(?:\.(\d+))?(?:-(\d+))?$/;
const DEFAULT_FORMAT = '1.0-2';
const SPACE = /^\s+$/;
const ENDS_WITH_SYMBOL = /\p{Sc}$/u;
const NO_BREAK_SPACE = '\u00a0';

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

function ownSymbol(symbols: TxAmountSymbols | undefined, currency: string): string | undefined {
  return symbols?.[currency] ?? symbols?.[currency.toUpperCase()];
}

function isSign(part: Intl.NumberFormatPart | undefined): boolean {
  return part?.type === 'minusSign' || part?.type === 'plusSign';
}

function placeSymbol(parts: Intl.NumberFormatPart[], position: TxAmountSymbolPosition): Intl.NumberFormatPart[] {
  const index = parts.findIndex((part) => part.type === 'currency');
  if (position === 'auto' || index < 0) {
    return parts;
  }
  const currency = parts[index];
  const number = parts.filter((part, at) => at !== index && !(Math.abs(at - index) === 1 && part.type === 'literal' && SPACE.test(part.value)));
  const space: Intl.NumberFormatPart = { type: 'literal', value: NO_BREAK_SPACE };
  if (position === 'after') {
    return [...number, space, currency];
  }
  const lead = isSign(number[0]) ? 1 : 0;
  return [...number.slice(0, lead), currency, ...(ENDS_WITH_SYMBOL.test(currency.value) ? [] : [space]), ...number.slice(lead)];
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
  if (!currency) {
    return toSegments(new Intl.NumberFormat(options.locale, plain).formatToParts(amount));
  }
  let parts: Intl.NumberFormatPart[];
  try {
    parts = new Intl.NumberFormat(options.locale, { ...base(options.format), style: 'currency', currency, currencyDisplay: options.currencyDisplay ?? 'narrowSymbol' }).formatToParts(amount);
  } catch {
    parts = [...new Intl.NumberFormat(options.locale, plain).formatToParts(amount), { type: 'literal', value: ' ' }, { type: 'currency', value: currency }];
  }
  const symbol = ownSymbol(options.symbols, currency);
  const named = symbol === undefined ? parts : parts.map((part) => (part.type === 'currency' ? { ...part, value: symbol } : part));
  return toSegments(placeSymbol(named, options.symbolPosition ?? 'auto'));
}
