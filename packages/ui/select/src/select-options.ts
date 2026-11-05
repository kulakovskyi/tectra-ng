import { TxFilterMatchMode, TxOptionFields, TxSelectItem, TxSelectRow } from './select.types';

export function readOptionField(option: unknown, field: string | undefined): unknown {
  if (!field || option === null || typeof option !== 'object') {
    return option;
  }
  return field
    .split('.')
    .reduce<unknown>((current, key) => (current !== null && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined), option);
}

const BASE_LETTERS: Record<string, string> = { ł: 'l', ø: 'o', đ: 'd', ß: 'ss', æ: 'ae', œ: 'oe', ı: 'i', ħ: 'h', þ: 'th' };

export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase()
    .replace(/[łøđßæœıħþ]/g, (letter) => BASE_LETTERS[letter]);
}

export function matchesQuery(text: string, query: string, mode: TxFilterMatchMode): boolean {
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

export function sameOptionValue(a: unknown, b: unknown, dataKey: string | undefined): boolean {
  if (dataKey && a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    return readOptionField(a, dataKey) === readOptionField(b, dataKey);
  }
  return a === b;
}

export interface TxOptionRowsRequest {
  options: readonly unknown[];
  fields: TxOptionFields;
  group: boolean;
  idPrefix: string;
  query: string;
  filterFields: readonly string[];
  matchMode: TxFilterMatchMode;
  isSelected: (value: unknown) => boolean;
}

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
      disabled: !!(fields.disabled && option !== null && typeof option === 'object' && readOptionField(option, fields.disabled)),
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

export function isSelectableRow(row: TxSelectRow | undefined): row is TxSelectItem {
  return row?.type === 'option' && !row.disabled;
}
