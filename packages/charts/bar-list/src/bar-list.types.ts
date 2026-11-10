import { Params } from '@angular/router';

export interface TxBarListItem {
  label: string;
  value: number;
  link?: string | readonly unknown[];
  queryParams?: Params;
}

export interface TxBarListRow {
  label: string;
  raw: number;
  value: string;
  share: number;
  percent: string;
  link?: string | readonly unknown[];
  queryParams?: Params;
}

export type TxBarListPart = 'root' | 'list' | 'item' | 'row' | 'track' | 'bar' | 'label' | 'value' | 'percent' | 'empty' | 'skeleton';
