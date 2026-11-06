import { TxIconName } from '@tectra-ng/icons';

export type TxAccordionPanelValue = string | number;
export type TxAccordionValue = TxAccordionPanelValue | TxAccordionPanelValue[] | null;
export type TxAccordionTone = 'info' | 'success' | 'warn' | 'danger';
export type TxAccordionIcon = TxIconName | (string & {});
export type TxAccordionPart = 'root' | 'panel' | 'header' | 'headerContent' | 'toggleIcon' | 'content' | 'contentInner';

export interface TxAccordionItem {
  header: string;
  content?: string;
  value?: TxAccordionPanelValue;
  tone?: TxAccordionTone;
  disabled?: boolean;
  [key: string]: unknown;
}

export interface TxAccordionToggleEvent {
  value: TxAccordionPanelValue;
  index: number;
  item?: TxAccordionItem;
}

export interface TxAccordionItemContext {
  $implicit: TxAccordionItem;
  item: TxAccordionItem;
  index: number;
  active: boolean;
}

export interface TxAccordionToggleIconContext {
  $implicit: boolean;
  active: boolean;
}
