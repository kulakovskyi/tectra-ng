import { DocTableColumn } from '../types/doc-table.interface';

export const MEMBER_COLUMNS: DocTableColumn[] = [
  { key: 'name', label: 'Name', format: 'code' },
  { key: 'type', label: 'Type', format: 'code' },
  { key: 'default', label: 'Default', format: 'code' },
  { key: 'description', label: 'Description', format: 'html' },
];

export const SLOT_COLUMNS: DocTableColumn[] = [
  { key: 'name', label: 'Name', format: 'code' },
  { key: 'description', label: 'Description', format: 'html' },
];

export const TOKEN_COLUMNS: DocTableColumn[] = [
  { key: 'name', label: 'Variable', format: 'code' },
  { key: 'value', label: 'Default', format: 'code' },
];

export const KEYBOARD_COLUMNS: DocTableColumn[] = [
  { key: 'key', label: 'Key', format: 'code' },
  { key: 'action', label: 'Action', format: 'html' },
];
