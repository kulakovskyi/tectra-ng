export type TxCountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds';
export type TxCountdownFormat = 'number' | 'clock';
export type TxCountdownTarget = Date | string | number | null | undefined;
export type TxCountdownPart = 'root';

export interface TxCountdownContext {
  $implicit: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}
