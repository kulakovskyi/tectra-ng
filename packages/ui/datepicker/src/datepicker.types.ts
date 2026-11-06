import { TxCalendarDay } from './calendar';

export type TxDatePickerSelectionMode = 'single' | 'multiple' | 'range';
export type TxDatePickerView = 'date' | 'month' | 'year';
export type TxDatePickerIconDisplay = 'button' | 'input';
export type TxDatePickerHourFormat = '12' | '24';
export type TxDatePickerDataType = 'date' | 'string';
export type TxDatePickerSize = 'small' | 'medium' | 'large';
export type TxDatePickerVariant = 'outlined' | 'filled';
export type TxDatePickerValue = Date | readonly (Date | null)[] | string | readonly (string | null)[] | null;

export type TxDatePickerPart =
  | 'root'
  | 'input'
  | 'dropdown'
  | 'inputIcon'
  | 'clear'
  | 'panel'
  | 'header'
  | 'title'
  | 'previous'
  | 'next'
  | 'selectMonth'
  | 'selectYear'
  | 'calendar'
  | 'table'
  | 'weekday'
  | 'weekNumber'
  | 'day'
  | 'monthView'
  | 'month'
  | 'yearView'
  | 'year'
  | 'timePicker'
  | 'buttonbar';

export interface TxDatePickerResponsiveOption {
  breakpoint: string;
  numberOfMonths: number;
}

export interface TxDatePickerMonthChangeEvent {
  month: number;
  year: number;
}

export interface TxDatePickerDateContext {
  $implicit: TxCalendarDay;
  selected: boolean;
  inRange: boolean;
}

export interface TxDatePickerDecadeContext {
  $implicit: readonly number[];
}

export interface TxDatePickerButtonBarContext {
  today: () => void;
  clear: () => void;
}
