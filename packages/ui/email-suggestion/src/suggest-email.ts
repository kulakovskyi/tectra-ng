import { TxEmailSuggestionResult } from './email-suggestion.types';

export const TX_COMMON_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'zoho.com',
];

const LOCAL_PART = /^[^\s@]+$/;

export function editDistance(a: string, b: string): number {
  const table = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(table[i - 1][j] + 1, table[i][j - 1] + 1, table[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        table[i][j] = Math.min(table[i][j], table[i - 2][j - 2] + 1);
      }
    }
  }
  return table[a.length][b.length];
}

export function suggestEmail(value: string | null | undefined, domains: readonly string[], known: readonly string[] = TX_COMMON_EMAIL_DOMAINS): TxEmailSuggestionResult | null {
  const email = (value ?? '').trim();
  const own = domains.map((domain) => domain.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
  if (!email) {
    return null;
  }
  const at = email.lastIndexOf('@');
  const local = at < 0 ? email : email.slice(0, at);
  if (!LOCAL_PART.test(local)) {
    return null;
  }
  if (at < 0) {
    return own.length ? { email: `${local}@${own[0]}`, kind: 'complete' } : null;
  }
  const host = email.slice(at + 1).toLowerCase();
  const candidates = [...new Set([...own, ...known.map((domain) => domain.toLowerCase())])];
  if (candidates.includes(host)) {
    return null;
  }
  const completed = own.find((domain) => domain.startsWith(host));
  if (completed) {
    return { email: `${local}@${completed}`, kind: 'complete' };
  }
  if (host.length < 3) {
    return null;
  }
  const limit = host.length > 6 ? 2 : 1;
  const best = candidates
    .map((domain) => ({ domain, distance: editDistance(host, domain) }))
    .filter((entry) => entry.distance > 0 && entry.distance <= limit)
    .sort((a, b) => a.distance - b.distance)[0];
  return best ? { email: `${local}@${best.domain}`, kind: 'typo' } : null;
}
