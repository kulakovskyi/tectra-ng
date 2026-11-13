/** Colour tone of a segment. */
export type TxSegmentedBarTone = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'neutral';

/** Height of `tx-segmented-bar`. */
export type TxSegmentedBarSize = 'small' | 'large';

/** One segment of `tx-segmented-bar`: a key, a label, a value and a tone. */
export interface TxSegmentedBarItem {
  /** Unique key of the segment. */
  key: string;
  /** Name of the segment. */
  label: string;
  /** Size of the segment; negative or missing values count as zero. */
  value: number;
  /** Colour tone (default `primary`). */
  tone?: TxSegmentedBarTone;
}

/** One segment ready to draw, with formatted texts. */
export interface TxSegmentedBarSegment {
  /** Key of the segment. */
  key: string;
  /** Name of the segment. */
  label: string;
  /** Value, never below zero. */
  raw: number;
  /** Formatted value. */
  value: string;
  /** Share of the total, 0 to 100. */
  share: number;
  /** Formatted share with a percent sign, rounded to one decimal. */
  percent: string;
  /** Colour tone. */
  tone: TxSegmentedBarTone;
  /** `true` for a segment with a zero value. */
  isEmpty: boolean;
}

/** Parts of `tx-segmented-bar` that `pt` can style. */
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
