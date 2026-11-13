/** Weekday and month names of a locale. */
export interface TxDateNames {
  /** Long weekday names, Sunday first. */
  dayNames: readonly string[];
  /** Short weekday names, Sunday first. */
  dayNamesShort: readonly string[];
  /** Long month names, January first. */
  monthNames: readonly string[];
  /** Short month names, January first. */
  monthNamesShort: readonly string[];
}

/** How a time is written: clock, seconds, separator and AM / PM texts. */
export interface TxTimeFormat {
  /** `12` with AM and PM, or `24`. */
  hourFormat: '12' | '24';
  /** Whether seconds are shown. */
  showSeconds: boolean;
  /** Text between hours, minutes and seconds. */
  separator: string;
  /** Text for the morning in the 12-hour clock. */
  am: string;
  /** Text for the afternoon in the 12-hour clock. */
  pm: string;
}

const TICKS_TO_UNIX_EPOCH = 621355968000000000;

/** Reads the weekday and month names, long and short, for a locale; weekdays start on Sunday. */
export function dateNames(locale: string): TxDateNames {
  const day = (style: 'long' | 'short') => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2024, 0, 7 + index)));
  const month = (style: 'long' | 'short') => Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(locale, { month: style }).format(new Date(2024, index, 1)));
  return { dayNames: day('long'), dayNamesShort: day('short'), monthNames: month('long'), monthNamesShort: month('short') };
}

function dayOfYear(date: Date): number {
  return Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
}

/**
 * Formats a date with a format string: `d` day, `o` day of the year, `D` weekday name, `m` month, `M` month name, `y` year, `@` Unix ms, `!` ticks and `'text'` literal; doubling a letter gives the long form.
 */
export function formatDate(date: Date | null | undefined, format: string, names: TxDateNames): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  let output = '';
  let literal = false;
  let index = 0;
  const repeated = (char: string) => {
    const matches = index + 1 < format.length && format.charAt(index + 1) === char;
    if (matches) index++;
    return matches;
  };
  const number = (char: string, value: number, size: number) => {
    let text = String(value);
    if (repeated(char)) while (text.length < size) text = `0${text}`;
    return text;
  };
  const name = (char: string, value: number, short: readonly string[], long: readonly string[]) => (repeated(char) ? long[value] : short[value]);
  for (; index < format.length; index++) {
    const char = format.charAt(index);
    if (literal) {
      if (char === "'" && !repeated("'")) literal = false;
      else output += char;
      continue;
    }
    switch (char) {
      case 'd':
        output += number('d', date.getDate(), 2);
        break;
      case 'D':
        output += name('D', date.getDay(), names.dayNamesShort, names.dayNames);
        break;
      case 'o':
        output += number('o', dayOfYear(date), 3);
        break;
      case 'm':
        output += number('m', date.getMonth() + 1, 2);
        break;
      case 'M':
        output += name('M', date.getMonth(), names.monthNamesShort, names.monthNames);
        break;
      case 'y':
        output += repeated('y') ? date.getFullYear() : String(date.getFullYear() % 100).padStart(2, '0');
        break;
      case '@':
        output += date.getTime();
        break;
      case '!':
        output += date.getTime() * 10000 + TICKS_TO_UNIX_EPOCH;
        break;
      case "'":
        if (repeated("'")) output += "'";
        else literal = true;
        break;
      default:
        output += char;
    }
  }
  return output;
}

/** Formats the time of a date with the hour format, separator and AM / PM texts; empty for an empty date. */
export function formatTime(date: Date | null | undefined, format: TxTimeFormat): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  let hours = date.getHours();
  let suffix = '';
  if (format.hourFormat === '12') {
    suffix = ` ${hours >= 12 ? format.pm : format.am}`;
    hours = hours % 12 || 12;
  }
  const seconds = format.showSeconds ? `${format.separator}${pad(date.getSeconds())}` : '';
  return `${pad(hours)}${format.separator}${pad(date.getMinutes())}${seconds}${suffix}`;
}

/** Turns a short year cutoff into a two-digit year; `+10` means ten years after the current one. */
export function resolveCutoff(cutoff: string | number, now = new Date()): number {
  return typeof cutoff === 'string' && cutoff.startsWith('+') ? (now.getFullYear() % 100) + parseInt(cutoff.slice(1), 10) : Number(cutoff);
}

/**
 * Reads text written in a `formatDate` format into a date; `null` when the text does not match or the date does not exist.
 */
export function parseDate(text: string, format: string, names: TxDateNames, shortYearCutoff: string | number = '+10', now = new Date()): Date | null {
  const value = text.trim();
  if (!value) return null;
  let position = 0;
  let year = -1;
  let month = -1;
  let day = -1;
  let doy = -1;
  let literal = false;
  let index = 0;
  const repeated = (char: string) => {
    const matches = index + 1 < format.length && format.charAt(index + 1) === char;
    if (matches) index++;
    return matches;
  };
  const number = (char: string): number => {
    const twice = repeated(char);
    const size = char === '@' ? 14 : char === '!' ? 20 : char === 'y' && twice ? 4 : char === 'o' ? 3 : 2;
    const min = char === 'y' ? size : 1;
    const match = new RegExp(`^\\d{${min},${size}}`).exec(value.slice(position));
    if (!match) throw new Error('number');
    position += match[0].length;
    return parseInt(match[0], 10);
  };
  const name = (char: string, short: readonly string[], long: readonly string[]): number => {
    const list = (repeated(char) ? long : short).map((entry, entryIndex) => [entryIndex, entry] as const).sort((a, b) => b[1].length - a[1].length);
    const rest = value.slice(position).toLowerCase();
    for (const [entryIndex, entry] of list) {
      if (rest.startsWith(entry.toLowerCase())) {
        position += entry.length;
        return entryIndex + 1;
      }
    }
    throw new Error('name');
  };
  const literalChar = (char: string) => {
    if (value.charAt(position) !== char) throw new Error('literal');
    position++;
  };
  try {
    for (; index < format.length; index++) {
      const char = format.charAt(index);
      if (literal) {
        if (char === "'" && !repeated("'")) literal = false;
        else literalChar(char);
        continue;
      }
      switch (char) {
        case 'd':
          day = number('d');
          break;
        case 'D':
          name('D', names.dayNamesShort, names.dayNames);
          break;
        case 'o':
          doy = number('o');
          break;
        case 'm':
          month = number('m');
          break;
        case 'M':
          month = name('M', names.monthNamesShort, names.monthNames);
          break;
        case 'y':
          year = number('y');
          break;
        case '@': {
          const date = new Date(number('@'));
          year = date.getFullYear();
          month = date.getMonth() + 1;
          day = date.getDate();
          break;
        }
        case '!': {
          const date = new Date((number('!') - TICKS_TO_UNIX_EPOCH) / 10000);
          year = date.getFullYear();
          month = date.getMonth() + 1;
          day = date.getDate();
          break;
        }
        case "'":
          if (repeated("'")) literalChar("'");
          else literal = true;
          break;
        default:
          literalChar(char);
      }
    }
  } catch {
    return null;
  }
  if (position < value.length) return null;
  if (year === -1) year = now.getFullYear();
  else if (year < 100) year += now.getFullYear() - (now.getFullYear() % 100) + (year <= resolveCutoff(shortYearCutoff, now) ? 0 : -100);
  if (doy > -1) {
    month = 1;
    day = doy;
    for (;;) {
      const days = new Date(year, month, 0).getDate();
      if (day <= days) break;
      month++;
      day -= days;
    }
  }
  if (month < 1 || day < 1) return null;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/**
 * Reads text like `14:30` or `2:30 PM` into hours, minutes and seconds; `null` when it does not fit the format.
 */
export function parseTime(text: string, format: TxTimeFormat): { hours: number; minutes: number; seconds: number } | null {
  const value = text.trim();
  const twelve = format.hourFormat === '12';
  const match = new RegExp(`^(\\d{1,2})${escapeRegExp(format.separator)}(\\d{1,2})(?:${escapeRegExp(format.separator)}(\\d{1,2}))?\\s*(${escapeRegExp(format.am)}|${escapeRegExp(format.pm)})?$`, 'i').exec(value);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  const period = match[4]?.toLowerCase();
  if (twelve) {
    if (hours < 1 || hours > 12 || !period) return null;
    hours = (hours % 12) + (period === format.pm.toLowerCase() ? 12 : 0);
  } else if (hours > 23 || period) return null;
  if (minutes > 59 || seconds > 59) return null;
  return { hours, minutes, seconds };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
