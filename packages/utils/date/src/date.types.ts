export type TxDateInput = Date | string | number | null | undefined;

export interface TxDateFormatConfig {
  format: string;
  empty: string;
  locale: string;
  timezone: string | undefined;
}

export interface TxIsoRange {
  start: string;
  end: string;
}
