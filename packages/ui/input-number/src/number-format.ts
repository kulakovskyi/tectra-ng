/** Options of `TxNumberFormat`: locale, currency, digits and affixes. */
export interface TxNumberFormatOptions {
  /** Locale that sets the decimal and group separators. */
  locale: string;
  /** Plain number or currency. */
  mode: 'decimal' | 'currency';
  /** ISO 4217 code used in `currency` mode (default `USD`). */
  currency?: string;
  /** How the currency is written (default `symbol`). */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** Separates thousands with the group separator. */
  useGrouping: boolean;
  /** Fewest fraction digits shown; 0 for numbers, the currency default for amounts. */
  minFractionDigits?: number;
  /** Most fraction digits allowed; 3 for numbers, the currency default for amounts. */
  maxFractionDigits?: number;
  /** Text added before the number, ahead of any currency symbol. */
  prefix?: string;
  /** Text added after the number, such as a unit. */
  suffix?: string;
}

interface TxNumberRead {
  negative: boolean;
  digits: string;
  fraction: string | null;
}

const NUMBER_PARTS = ['integer', 'group', 'decimal', 'fraction'];

/** Formats and parses numbers as the user types them, keeping the caret in place; used by `tx-input-number`. */
export class TxNumberFormat {
  /** Decimal separator of the locale. */
  readonly decimal: string;
  /** Group (thousands) separator of the locale. */
  readonly group: string;
  /** Text shown before the number: prefix and leading currency symbol. */
  readonly before: string;
  /** Text shown after the number: trailing currency symbol and suffix. */
  readonly after: string;
  /** Most fraction digits the field accepts. */
  readonly maxFraction: number;
  private full: Intl.NumberFormat;
  private integer: Intl.NumberFormat;

  constructor(options: TxNumberFormatOptions) {
    const style: Intl.NumberFormatOptions =
      options.mode === 'currency'
        ? { style: 'currency', currency: options.currency ?? 'USD', currencyDisplay: options.currencyDisplay ?? 'symbol' }
        : { style: 'decimal' };
    const defaults = new Intl.NumberFormat(options.locale, style).resolvedOptions();
    const currency = options.mode === 'currency';
    const min = options.minFractionDigits ?? (currency ? (defaults.minimumFractionDigits ?? 2) : 0);
    const max = Math.max(min, options.maxFractionDigits ?? (currency ? (defaults.maximumFractionDigits ?? 2) : 3));
    this.full = new Intl.NumberFormat(options.locale, { ...style, useGrouping: options.useGrouping, minimumFractionDigits: min, maximumFractionDigits: max });
    this.integer = new Intl.NumberFormat(options.locale, { useGrouping: options.useGrouping, maximumFractionDigits: 0 });
    const plain = new Intl.NumberFormat(options.locale).formatToParts(12345.6);
    this.decimal = plain.find((part) => part.type === 'decimal')?.value ?? '.';
    this.group = plain.find((part) => part.type === 'group')?.value ?? ',';
    this.maxFraction = max;
    const sample = this.full.formatToParts(-12345.6);
    const first = sample.findIndex((part) => NUMBER_PARTS.includes(part.type));
    const last = sample.length - 1 - [...sample].reverse().findIndex((part) => NUMBER_PARTS.includes(part.type));
    const affix = (parts: Intl.NumberFormatPart[]) => parts.filter((part) => part.type !== 'minusSign').map((part) => part.value).join('');
    this.before = (options.prefix ?? '') + affix(sample.slice(0, first));
    this.after = affix(sample.slice(last + 1)) + (options.suffix ?? '');
  }

  /** Formats a value for display, with prefix, currency and suffix; empty text for `null`. */
  format(value: number | null): string {
    if (value === null || Number.isNaN(value)) {
      return '';
    }
    const number = this.full
      .formatToParts(Math.abs(value))
      .filter((part) => NUMBER_PARTS.includes(part.type))
      .map((part) => part.value)
      .join('');
    return `${value < 0 ? '-' : ''}${this.before}${number}${this.after}`;
  }

  /** Reformats text while typing and returns the display text with the parsed value. */
  formatTyping(text: string): { display: string; value: number | null } {
    const read = this.read(text);
    if (read.digits === '' && read.fraction === null) {
      return { display: read.negative ? '-' : '', value: null };
    }
    const integer = (read.digits || '0').replace(/^0+(?=\d)/, '');
    const fraction = read.fraction === null ? null : read.fraction.slice(0, this.maxFraction);
    const grouped = this.integer.format(BigInt(integer));
    const display = `${read.negative ? '-' : ''}${this.before}${grouped}${fraction === null ? '' : this.decimal + fraction}${this.after}`;
    const value = Number(`${read.negative ? '-' : ''}${integer}${fraction ? `.${fraction}` : ''}`);
    return { display, value };
  }

  /** Reads a number from text in this format; `null` when it holds no digits. */
  parse(text: string): number | null {
    return this.formatTyping(text).value;
  }

  /** Counts the digits and the decimal separator before a caret position. */
  countBefore(text: string, caret: number): number {
    let count = 0;
    let decimalSeen = false;
    for (const char of this.strip(text.slice(0, caret))) {
      if (/\d/.test(char)) {
        count += 1;
      } else if (!decimalSeen && this.isDecimal(char)) {
        decimalSeen = true;
        count += 1;
      }
    }
    return count;
  }

  /** Finds the caret position in the display text after a given count of digits and decimal separator. */
  caretFor(display: string, count: number): number {
    const start = (display.startsWith('-') ? 1 : 0) + this.before.length;
    if (count <= 0) {
      return start;
    }
    let seen = 0;
    for (let index = start; index < display.length - this.after.length; index += 1) {
      if (/\d/.test(display[index]) || display[index] === this.decimal) {
        seen += 1;
        if (seen === count) {
          return index + 1;
        }
      }
    }
    return display.length - this.after.length;
  }

  private read(text: string): TxNumberRead {
    const negative = text.includes('-');
    let digits = '';
    let fraction: string | null = null;
    for (const char of this.strip(text)) {
      if (/\d/.test(char)) {
        if (fraction === null) {
          digits += char;
        } else {
          fraction += char;
        }
      } else if (fraction === null && this.maxFraction > 0 && this.isDecimal(char)) {
        fraction = '';
      }
    }
    return { negative, digits, fraction };
  }

  private strip(text: string): string {
    let body = text.replace('-', '');
    if (this.before && body.startsWith(this.before)) {
      body = body.slice(this.before.length);
    }
    if (this.after && body.endsWith(this.after)) {
      body = body.slice(0, -this.after.length);
    }
    return body;
  }

  private isDecimal(char: string): boolean {
    return char === this.decimal || (this.decimal === ',' && char === '.' && this.group !== '.');
  }
}
