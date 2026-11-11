import { Pipe, PipeTransform } from '@angular/core';

export type TxTruncatePosition = 'end' | 'middle';

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', е: 'e', ё: 'e', є: 'ye', ж: 'zh', з: 'z', и: 'i', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function truncate(value: string | null | undefined, limit = 15, trail = '...', position: TxTruncatePosition = 'end', empty = '-'): string {
  if (!value) {
    return empty;
  }
  const chars = Array.from(value);
  if (chars.length <= limit) {
    return value;
  }
  if (position === 'middle') {
    const head = Math.ceil(limit / 2);
    const tail = Math.floor(limit / 2);
    return chars.slice(0, head).join('') + trail + (tail ? chars.slice(-tail).join('') : '');
  }
  return chars.slice(0, limit).join('') + trail;
}

export function capitalize(value: string | null | undefined): string {
  return value ? value.charAt(0).toLocaleUpperCase() + value.slice(1) : (value ?? '');
}

export function normalizeKeyword(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

export function withHttpPrefix(link: string | null | undefined, protocol: 'https' | 'http' = 'https'): string {
  const value = link?.trim() ?? '';
  if (!value) {
    return '';
  }
  return /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `${protocol}://${value.replace(/^\/\//, '')}`;
}

export function transliterate(value: string): string {
  return Array.from(value)
    .map((char) => {
      const lower = char.toLowerCase();
      const latin = CYRILLIC_TO_LATIN[lower];
      if (latin === undefined || latin === '') {
        return latin ?? char;
      }
      return char === lower ? latin : latin.charAt(0).toUpperCase() + latin.slice(1);
    })
    .join('');
}

export function slugify(value: string, separator = '-'): string {
  return transliterate(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

@Pipe({ name: 'txTruncate' })
export class TxTruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 15, trail = '...', position: TxTruncatePosition = 'end'): string {
    return truncate(value, limit, trail, position);
  }
}

@Pipe({ name: 'txCapitalize' })
export class TxCapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return capitalize(value);
  }
}

@Pipe({ name: 'txHttpPrefix' })
export class TxHttpPrefixPipe implements PipeTransform {
  transform(link: string | null | undefined, protocol: 'https' | 'http' = 'https'): string {
    return withHttpPrefix(link, protocol);
  }
}
