import { TxFileKind } from './file-upload.types';

const KINDS: Record<Exclude<TxFileKind, 'image' | 'media' | 'other'>, readonly string[]> = {
  pdf: ['pdf'],
  sheet: ['csv', 'tsv', 'xls', 'xlsx', 'ods', 'numbers'],
  document: ['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'pages'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2'],
};

/** Lower-case extension of a file name without the dot; empty when it has none. */
export function fileExtension(file: Pick<File, 'name'>): string {
  const dot = file.name.lastIndexOf('.');
  return dot > 0 ? file.name.slice(dot + 1).toLowerCase() : '';
}

/** Sorts a file into a `TxFileKind` by its MIME type and extension. */
export function fileKind(file: Pick<File, 'name' | 'type'>): TxFileKind {
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    return 'media';
  }
  const extension = fileExtension(file);
  const match = (Object.keys(KINDS) as (keyof typeof KINDS)[]).find((kind) => KINDS[kind].includes(extension));
  return match ?? (file.type === 'application/pdf' ? 'pdf' : 'other');
}

/**
 * Checks a file against an `accept` list of extensions, MIME types and `type/*` wildcards; an empty
 * list accepts everything.
 */
export function fileMatchesAccept(file: Pick<File, 'name' | 'type'>, accept: string | undefined): boolean {
  const rules = (accept ?? '')
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) {
    return true;
  }
  const type = file.type.toLowerCase();
  const extension = `.${fileExtension(file)}`;
  return rules.some((rule) => {
    if (rule.startsWith('.')) {
      return rule === extension;
    }
    if (rule.endsWith('/*')) {
      return type.startsWith(rule.slice(0, -1));
    }
    return rule === type;
  });
}

/** Tells whether two `File` objects are the same file by name, size, type and modified time. */
export function sameFile(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.type === b.type && a.lastModified === b.lastModified;
}

/** Turns an `accept` list into a short readable label such as `PNG, JPEG`. */
export function acceptLabel(accept: string | undefined): string {
  const labels = (accept ?? '')
    .split(',')
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => {
      if (rule.startsWith('.')) {
        return rule.slice(1).toUpperCase();
      }
      const [type, subtype = ''] = rule.split('/');
      return subtype === '*' ? `${type}/*` : subtype.replace(/^x-/, '').split(/[.+-]/).pop()?.toUpperCase() ?? rule;
    });
  return [...new Set(labels)].join(', ');
}
