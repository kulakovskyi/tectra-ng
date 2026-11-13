import { TxCalendarDay } from './calendar';

/** What the user picks: one date (`single`), several (`multiple`) or a `range`. */
export type TxDatePickerSelectionMode = 'single' | 'multiple' | 'range';
/** Which panel the calendar shows: days (`date`), months (`month`) or years (`year`). */
export type TxDatePickerView = 'date' | 'month' | 'year';
/** Where the calendar icon sits: a `button` joined to the field, or an icon inside it (`input`). */
export type TxDatePickerIconDisplay = 'button' | 'input';
/** Clock of the time picker: `12` with AM and PM, or `24`. */
export type TxDatePickerHourFormat = '12' | '24';
/** Type of the model values: `date` for `Date` objects, `string` for text in `dateFormat`. */
export type TxDatePickerDataType = 'date' | 'string';
/** Size of the field: `small`, `medium` or `large`. */
export type TxDatePickerSize = 'small' | 'medium' | 'large';
/** Look of the field: `outlined` or `filled`. */
export type TxDatePickerVariant = 'outlined' | 'filled';
/** Value of `tx-datepicker`: a date, a list of dates (range or multiple), their text forms, or `null`. */
export type TxDatePickerValue = Date | readonly (Date | null)[] | string | readonly (string | null)[] | null;

/** Names of the parts of `tx-datepicker` that `pt` can style. */
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

/** How many months show while the window is at most `breakpoint` wide. */
export interface TxDatePickerResponsiveOption {
  /** Largest window width this option applies to, as a CSS length such as `768px`. */
  breakpoint: string;
  /** Number of months shown side by side. */
  numberOfMonths: number;
}

/** Payload of `monthChange`: the month the calendar moved to. */
export interface TxDatePickerMonthChangeEvent {
  /** Month number, 1 for January to 12. */
  month: number;
  /** Year of the month. */
  year: number;
}

/** Context of the `txDatePickerDate` template: one day cell. */
export interface TxDatePickerDateContext {
  /** The calendar day. */
  $implicit: TxCalendarDay;
  /** Whether the day is picked. */
  selected: boolean;
  /** Whether the day lies inside the picked range. */
  inRange: boolean;
}

/** Context of the `txDatePickerDecade` template. */
export interface TxDatePickerDecadeContext {
  /** The years of the decade shown. */
  $implicit: readonly number[];
}

/** Context of the `txDatePickerButtonBar` template. */
export interface TxDatePickerButtonBarContext {
  /** Moves to and picks today. */
  today: () => void;
  /** Clears the value. */
  clear: () => void;
}
