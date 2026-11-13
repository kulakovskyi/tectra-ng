import { TxHighlightOptions, TxHighlightPart, TxHighlightTerms } from './highlight-text.types';

function fold(value: string, caseSensitive: boolean): string {
  const plain = value.normalize('NFD').replace(/\p{M}/gu, '');
  return caseSensitive ? plain : plain.toLocaleLowerCase();
}

/**
 * Splits text into plain and matched parts for the given terms, ignoring case and diacritics unless
 * told otherwise.
 */
export function highlightParts(text: string | null | undefined, terms: TxHighlightTerms, options: TxHighlightOptions = {}): TxHighlightPart[] {
  const source = text ?? '';
  const caseSensitive = options.caseSensitive ?? false;
  const list = (typeof terms === 'string' || terms == null ? [terms ?? ''] : terms).map((term) => fold(term.trim(), caseSensitive)).filter(Boolean);
  if (!source) {
    return [];
  }
  if (!list.length) {
    return [{ text: source, match: false }];
  }

  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;
  for (const char of source) {
    const value = fold(char, caseSensitive);
    if (!value && ends.length) {
      ends[ends.length - 1] = offset + char.length;
    }
    for (let index = 0; index < value.length; index++) {
      starts.push(offset);
      ends.push(offset + char.length);
    }
    folded += value;
    offset += char.length;
  }

  const marked = new Array<boolean>(source.length).fill(false);
  for (const term of list) {
    let index = folded.indexOf(term);
    while (index !== -1) {
      marked.fill(true, starts[index], ends[index + term.length - 1]);
      index = folded.indexOf(term, index + term.length);
    }
  }

  const parts: TxHighlightPart[] = [];
  let start = 0;
  for (let index = 1; index <= source.length; index++) {
    if (index === source.length || marked[index] !== marked[start]) {
      parts.push({ text: source.slice(start, index), match: marked[start] });
      start = index;
    }
  }
  return parts;
}
