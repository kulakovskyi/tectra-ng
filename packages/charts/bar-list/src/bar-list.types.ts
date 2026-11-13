import { Params } from '@angular/router';

/** One row of `tx-bar-list`: a label, its value and an optional link. */
export interface TxBarListItem {
  /** Text over the bar. */
  label: string;
  /** Size of the bar; zero, negative and non-finite values are dropped. */
  value: number;
  /** Router link of the row; a row with a link becomes a router link. */
  link?: string | readonly unknown[];
  /** Query parameters of the router link. */
  queryParams?: Params;
}

/** A row of `tx-bar-list` ready to draw: formatted value and percent, and the bar size. */
export interface TxBarListRow {
  /** Text over the bar. */
  label: string;
  /** Original value of the item. */
  raw: number;
  /** Value formatted with `valueFormat`. */
  value: string;
  /** Bar width as a percent of the biggest value (0 to 100). */
  share: number;
  /** Share of the total, formatted with a trailing `%`. */
  percent: string;
  /** Router link of the row. */
  link?: string | readonly unknown[];
  /** Query parameters of the router link. */
  queryParams?: Params;
}

/** Parts of `tx-bar-list` that `pt` can style. */
export type TxBarListPart = 'root' | 'list' | 'item' | 'row' | 'track' | 'bar' | 'label' | 'value' | 'percent' | 'empty' | 'skeleton';
