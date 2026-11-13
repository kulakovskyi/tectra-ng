import { TxSelectFilterMatchMode, TxOptionFields, TxSelectItem, TxSelectRow } from './select.types';

/**
 * Reads an option field by name, with dots for nested fields; without a field or for a primitive
 * option it returns the option itself.
 */
export function readOptionField(option: unknown, field: string | undefined): unknown {
  if (!field || option === null || typeof option !== 'object') {
    return option;
  }
  return field
    .split('.')
    .reduce<unknown>((current, key) => (current !== null && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined), option);
}

const BASE_LETTERS: Record<string, string> = { ł: 'l', ø: 'o', đ: 'd', ß: 'ss', æ: 'ae', œ: 'oe', ı: 'i', ħ: 'h', þ: 'th' };

/** Lower-cases text and strips accents, so searches ignore case and diacritics. */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase()
    .replace(/[łøđßæœıħþ]/g, (letter) => BASE_LETTERS[letter]);
}

/** Whether the text matches an already folded query in the given mode; case and accents are ignored. */
export function matchesQuery(text: string, query: string, mode: TxSelectFilterMatchMode): boolean {
  const value = foldText(text);
  switch (mode) {
    case 'startsWith':
      return value.startsWith(query);
    case 'endsWith':
      return value.endsWith(query);
    case 'equals':
      return value === query;
    default:
      return value.includes(query);
  }
}

/** Compares two option values; objects with the same `dataKey` field count as equal. */
export function sameOptionValue(a: unknown, b: unknown, dataKey: string | undefined): boolean {
  if (dataKey && a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    return readOptionField(a, dataKey) === readOptionField(b, dataKey);
  }
  return a === b;
}

/** Input of `buildOptionRows`: the options, how to read them and the current filter. */
export interface TxOptionRowsRequest {
  /** Options or groups to build rows from; `null` or `undefined` items become loader rows. */
  options: readonly unknown[];
  /** Names of the option fields to read. */
  fields: TxOptionFields;
  /** Whether the options are groups with child options. */
  group: boolean;
  /** Prefix of the DOM ids of the rows. */
  idPrefix: string;
  /** Filter text; empty keeps every option. */
  query: string;
  /** Fields the query is matched against; the label field when empty. */
  filterFields: readonly string[];
  /** How the query is matched. */
  matchMode: TxSelectFilterMatchMode;
  /** Tells whether a value is selected. */
  isSelected: (value: unknown) => boolean;
  /** Tells whether a value cannot be picked, in addition to the disabled field. */
  isBlocked?: (value: unknown) => boolean;
}

/**
 * Builds the option list of select-like components from options, groups and a filter query; used by
 * `tx-select`, `tx-multiselect` and `tx-autocomplete`.
 */
export function buildOptionRows(request: TxOptionRowsRequest): TxSelectRow[] {
  const { options, fields, group, idPrefix, isSelected } = request;
  const query = foldText(request.query.trim());
  const rows: TxSelectRow[] = [];
  let index = 0;
  const toItem = (option: unknown): TxSelectItem => {
    const value = readOptionField(option, fields.value);
    const item: TxSelectItem = {
      type: 'option',
      id: `${idPrefix}-${index}`,
      index,
      label: String(readOptionField(option, fields.label) ?? ''),
      value,
      option,
      selected: isSelected(value),
      disabled:
        !!(fields.disabled && option !== null && typeof option === 'object' && readOptionField(option, fields.disabled)) ||
        !!request.isBlocked?.(value),
    };
    index += 1;
    return item;
  };
  const matches = (option: unknown): boolean =>
    !query ||
    (request.filterFields.length ? request.filterFields : [fields.label]).some((field) =>
      matchesQuery(String(readOptionField(option, field) ?? ''), query, request.matchMode),
    );

  if (group) {
    options.forEach((groupOption, groupIndex) => {
      const children = readOptionField(groupOption, fields.groupChildren);
      const items: TxSelectItem[] = [];
      for (const child of Array.isArray(children) ? children : []) {
        if (matches(child)) {
          items.push(toItem(child));
        } else {
          index += 1;
        }
      }
      if (items.length || !query) {
        rows.push({ type: 'group', id: `${idPrefix}-group-${groupIndex}`, label: String(readOptionField(groupOption, fields.groupLabel) ?? ''), group: groupOption });
        rows.push(...items);
      }
    });
    return rows;
  }

  for (const option of options) {
    if (option === undefined || option === null) {
      if (!query) {
        rows.push({ type: 'loader', id: `${idPrefix}-${index}`, index });
      }
      index += 1;
      continue;
    }
    if (matches(option)) {
      rows.push(toItem(option));
    } else {
      index += 1;
    }
  }
  return rows;
}

/** Whether a row is an option the user can pick (not a group, a loader or a disabled option). */
export function isSelectableRow(row: TxSelectRow | undefined): row is TxSelectItem {
  return row?.type === 'option' && !row.disabled;
}
