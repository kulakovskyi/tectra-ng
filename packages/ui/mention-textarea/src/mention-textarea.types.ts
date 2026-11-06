import { TxSelectPart } from '@tectra-ng/ui/select';

export interface TxMentionItem {
  label: string;
  value: string;
  image?: string;
  description?: string;
}

export type TxMentionTextareaPart = 'root' | 'textarea' | Extract<TxSelectPart, 'panel' | 'list' | 'option' | 'empty'>;

export interface TxMentionSearchEvent {
  query: string;
}
