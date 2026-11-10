export type TxSegmentedBarTone = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'neutral';

export type TxSegmentedBarSize = 'small' | 'large';

export interface TxSegmentedBarItem {
  key: string;
  label: string;
  value: number;
  tone?: TxSegmentedBarTone;
}

export interface TxSegmentedBarSegment {
  key: string;
  label: string;
  raw: number;
  value: string;
  share: number;
  percent: string;
  tone: TxSegmentedBarTone;
  isEmpty: boolean;
}

export type TxSegmentedBarPart =
  | 'root'
  | 'track'
  | 'segment'
  | 'legend'
  | 'legendItem'
  | 'dot'
  | 'label'
  | 'value'
  | 'percent'
  | 'aside';
