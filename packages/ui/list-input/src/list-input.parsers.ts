import { TxListInputParser, TxListInputResult, TxListInputType } from './list-input.types';

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:(?!-)[\p{L}\p{N}-]{1,63}(?<!-)\.)+(?:\p{L}{2,63}|xn--[a-z\d-]{2,59})$/u;
const PROTOCOL = /^[a-z][a-z\d+.-]*:\/\//i;
const PATH_START = /[/?#]/;
const PORT = /:\d+$/;
const TRAILING_DOT = /\.$/;
const EMAIL_LOCAL = /^[^\s@<>()[\]\\,;:"]+$/;

/** Separator that splits a pasted text into entries at whitespace, commas and semicolons. */
export const TX_LIST_INPUT_WORDS = /[\s,;]+/;
/**
 * Separator that splits a pasted text into entries at line breaks, commas and semicolons; spaces stay
 * inside an entry.
 */
export const TX_LIST_INPUT_LINES = /[\r\n,;]+/;

/** Reads a domain name from a token, dropping protocol, path and port, and lower-cases it; `null` when invalid. */
export function txParseDomain(token: string): string | null {
  const host = token.toLowerCase().replace(PROTOCOL, '');
  const pathIndex = host.search(PATH_START);
  const domain = (pathIndex === -1 ? host : host.slice(0, pathIndex)).replace(PORT, '').replace(TRAILING_DOT, '');
  return DOMAIN_PATTERN.test(domain) ? domain : null;
}

/**
 * Reads an email address from a token, dropping `mailto:` and angle brackets, and lower-cases it;
 * `null` when invalid.
 */
export function txParseEmail(token: string): string | null {
  const email = token
    .replace(/^mailto:/i, '')
    .replace(/^<(.*)>$/, '$1')
    .toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1) {
    return null;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).replace(TRAILING_DOT, '');
  return EMAIL_LOCAL.test(local) && DOMAIN_PATTERN.test(domain) ? `${local}@${domain}` : null;
}

/** Reads an http or https URL from a token, adding `https://` when missing; `null` when invalid. */
export function txParseUrl(token: string): string | null {
  let url: URL;
  try {
    url = new URL(PROTOCOL.test(token) ? token : `https://${token}`);
  } catch {
    return null;
  }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !DOMAIN_PATTERN.test(url.hostname.replace(TRAILING_DOT, ''))) {
    return null;
  }
  return url.pathname === '/' && !url.search && !url.hash ? url.origin : url.href;
}

/** Accepts any token as it is. */
export function txParseText(token: string): string | null {
  return token;
}

/** Parser of every `TxListInputType`. */
export const TX_LIST_INPUT_PARSERS: Record<TxListInputType, TxListInputParser> = {
  domain: txParseDomain,
  email: txParseEmail,
  url: txParseUrl,
  text: txParseText,
};

/**
 * Splits a text into entries with a parser; collects valid unique items, the invalid tokens and the
 * number of duplicates.
 */
export function txParseList(text: string | null | undefined, parser: TxListInputParser, separator: RegExp = TX_LIST_INPUT_WORDS): TxListInputResult {
  const items = new Set<string>();
  const invalid = new Set<string>();
  let duplicates = 0;
  for (const raw of (text ?? '').split(separator)) {
    const token = raw.trim();
    if (!token) {
      continue;
    }
    const item = parser(token);
    if (item === null || item === '') {
      invalid.add(token);
    } else if (items.has(item)) {
      duplicates++;
    } else {
      items.add(item);
    }
  }
  return { items: [...items], invalid: [...invalid], duplicates };
}
