export type TxMonthCalendarTone = 'primary' | 'info' | 'success' | 'warn' | 'danger' | 'neutral';

export type TxMonthCalendarDateInput = Date | string;

export type TxMonthCalendarPart = 'root' | 'grid' | 'head' | 'weekday' | 'week' | 'cell' | 'day' | 'number' | 'marker' | 'event' | 'more';

export interface TxMonthCalendarAvatar {
  src?: string | null;
  name?: string | null;
}

export interface TxMonthCalendarEvent<TData = unknown> {
  id: string;
  start: TxMonthCalendarDateInput;
  end?: TxMonthCalendarDateInput | null;
  title: string;
  tone: TxMonthCalendarTone;
  avatar?: TxMonthCalendarAvatar | null;
  data?: TData;
}

export interface TxMonthCalendarMarker {
  date: TxMonthCalendarDateInput;
  tone: TxMonthCalendarTone;
  label: string;
  icon?: string;
}

export interface TxMonthCalendarLabels {
  more: string;
  today: string;
  region: string;
}

export interface TxMonthCalendarDay {
  key: string;
  date: Date;
  index: number;
  day: number;
  column: number;
  inMonth: boolean;
  weekend: boolean;
  today: boolean;
  selected: boolean;
  markers: TxMonthCalendarMarker[];
  events: TxMonthCalendarEvent[];
  dots: TxMonthCalendarTone[];
  hidden: number;
}

export interface TxMonthCalendarSegment {
  key: string;
  event: TxMonthCalendarEvent;
  lane: number;
  column: number;
  span: number;
  startsHere: boolean;
  endsHere: boolean;
}

export interface TxMonthCalendarWeek {
  key: string;
  days: TxMonthCalendarDay[];
  segments: TxMonthCalendarSegment[];
}

export interface TxMonthCalendarWeekday {
  key: number;
  short: string;
  narrow: string;
  weekend: boolean;
}

export interface TxMonthCalendarEventContext {
  $implicit: TxMonthCalendarEvent;
  event: TxMonthCalendarEvent;
  segment: TxMonthCalendarSegment;
}

export interface TxMonthCalendarLayoutRequest {
  month: Date;
  events: readonly TxMonthCalendarEvent[];
  markers: readonly TxMonthCalendarMarker[];
  selectedDate: TxMonthCalendarDateInput | null;
  today: Date;
  weekStartsOn: number;
  maxLanes: number;
}
