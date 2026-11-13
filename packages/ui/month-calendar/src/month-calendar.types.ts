/** Color role of an event, marker or dot in `tx-month-calendar`. */
export type TxMonthCalendarTone = 'primary' | 'info' | 'success' | 'warn' | 'danger' | 'neutral';

/** A day given as a `Date` or a string such as `2025-03-14`; a plain `YYYY-MM-DD` string is read in local time. */
export type TxMonthCalendarDateInput = Date | string;

/** Parts of `tx-month-calendar` that `pt` can style. */
export type TxMonthCalendarPart = 'root' | 'grid' | 'head' | 'weekday' | 'week' | 'cell' | 'day' | 'number' | 'marker' | 'event' | 'more';

/** Avatar of an event: an image, or a name to show initials from. */
export interface TxMonthCalendarAvatar {
  /** Address of the avatar image. */
  src?: string | null;
  /** Name used for the initials and the accessible text when there is no image. */
  name?: string | null;
}

/** An event on `tx-month-calendar`; with an `end` it spans several days. */
export interface TxMonthCalendarEvent<TData = unknown> {
  /** Unique id of the event. */
  id: string;
  /** First day of the event. */
  start: TxMonthCalendarDateInput;
  /** Last day of the event, inclusive; a one-day event when empty. */
  end?: TxMonthCalendarDateInput | null;
  /** Text of the event. */
  title: string;
  /** Color of the event. */
  tone: TxMonthCalendarTone;
  /** Avatar shown before the title. */
  avatar?: TxMonthCalendarAvatar | null;
  /** Your own data, passed back in events and templates. */
  data?: TData;
}

/** A pill in the header of one day, such as a holiday or a deadline; a dot in the compact grid. */
export interface TxMonthCalendarMarker {
  /** Day of the marker. */
  date: TxMonthCalendarDateInput;
  /** Color of the marker. */
  tone: TxMonthCalendarTone;
  /** Text of the marker pill in the day header. */
  label: string;
  /** Icon name shown in the pill. */
  icon?: string;
}

/** Texts of `tx-month-calendar`. */
export interface TxMonthCalendarLabels {
  /** Text of the "more" button with a `{count}` placeholder. */
  more: string;
  /** Word added to the accessible name of today. */
  today: string;
  /** Accessible name of the calendar grid. */
  region: string;
}

/** One day cell of the laid out month. */
export interface TxMonthCalendarDay {
  /** Day as `YYYY-MM-DD`. */
  key: string;
  /** Day as a local `Date`. */
  date: Date;
  /** Day number from `dayIndex`. */
  index: number;
  /** Day of the month, 1 to 31. */
  day: number;
  /** Grid column of the day within its week, 1 to 7. */
  column: number;
  /** `false` for days of the neighboring months shown to fill the weeks. */
  inMonth: boolean;
  /** `true` for Saturday and Sunday. */
  weekend: boolean;
  /** `true` for the current day. */
  today: boolean;
  /** `true` for the selected day. */
  selected: boolean;
  /** Markers on this day. */
  markers: TxMonthCalendarMarker[];
  /** All events that cover this day. */
  events: TxMonthCalendarEvent[];
  /** Tones of the first three events, shown as dots in compact cells. */
  dots: TxMonthCalendarTone[];
  /** Number of events of this day that did not fit into the lanes. */
  hidden: number;
}

/** The part of an event inside one week, drawn as one bar. */
export interface TxMonthCalendarSegment {
  /** Unique key of the segment: event id and week. */
  key: string;
  /** The event the bar belongs to. */
  event: TxMonthCalendarEvent;
  /** Row of the bar below the day number, starting at 0. */
  lane: number;
  /** First grid column of the bar, 1 to 7. */
  column: number;
  /** Number of days the bar covers in this week. */
  span: number;
  /** `true` when the event begins in this week, so the bar has a rounded start. */
  startsHere: boolean;
  /** `true` when the event ends in this week, so the bar has a rounded end. */
  endsHere: boolean;
}

/** One row of the laid out month. */
export interface TxMonthCalendarWeek {
  /** First day of the week as `YYYY-MM-DD`. */
  key: string;
  /** The seven days of the week. */
  days: TxMonthCalendarDay[];
  /** Event bars of the week that fit into the lanes. */
  segments: TxMonthCalendarSegment[];
}

/** A column heading of the calendar. */
export interface TxMonthCalendarWeekday {
  /** Weekday number, 0 for Sunday to 6 for Saturday. */
  key: number;
  /** Short weekday name in the locale. */
  short: string;
  /** Narrow weekday name in the locale, used in small widths. */
  narrow: string;
  /** `true` for Saturday and Sunday. */
  weekend: boolean;
}

/** Context of a `txMonthCalendarEvent` template: one event bar. */
export interface TxMonthCalendarEventContext {
  /** The event to render. */
  $implicit: TxMonthCalendarEvent;
  /** The event to render. */
  event: TxMonthCalendarEvent;
  /** The bar being drawn, with its place in the week. */
  segment: TxMonthCalendarSegment;
}

/** Input of `buildMonthLayout`. */
export interface TxMonthCalendarLayoutRequest {
  /** Any date inside the month to lay out. */
  month: Date;
  /** Events to place. */
  events: readonly TxMonthCalendarEvent[];
  /** Markers to place. */
  markers: readonly TxMonthCalendarMarker[];
  /** Day to mark as selected; `null` for none. */
  selectedDate: TxMonthCalendarDateInput | null;
  /** Day to mark as today. */
  today: Date;
  /** First weekday of a week: 0 for Sunday to 6 for Saturday. */
  weekStartsOn: number;
  /** Most event rows per week; further events are counted in `hidden`. */
  maxLanes: number;
}
