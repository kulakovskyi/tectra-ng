export const MS_IN_SECOND = 1000;
/** Seconds in a minute (60). */
export const SECONDS_IN_MINUTE = 60;
/** Minutes in an hour (60). */
export const MINUTES_IN_HOUR = 60;
/** Hours in a day (24). */
export const HOURS_IN_DAY = 24;
/** Days in a week (7). */
export const DAYS_IN_WEEK = 7;
/** Months in a year (12). */
export const MONTHS_IN_YEAR = 12;
/** Seconds in an hour (3600). */
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
/** Seconds in a day (86400). */
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
/** Milliseconds in a minute (60000). */
export const MS_IN_MINUTE = MS_IN_SECOND * SECONDS_IN_MINUTE;
/** Milliseconds in an hour (3600000). */
export const MS_IN_HOUR = MS_IN_MINUTE * MINUTES_IN_HOUR;
/** Milliseconds in a day (86400000). */
export const MS_IN_DAY = MS_IN_HOUR * HOURS_IN_DAY;
/** Milliseconds in a week (604800000). */
export const MS_IN_WEEK = MS_IN_DAY * DAYS_IN_WEEK;

export const TX_DATE_FORMATS = {
  dateTime: 'dd.MM.yy HH:mm',
  date: 'dd.MM.yyyy',
  time: 'HH:mm:ss',
  timeShort: 'HH:mm',
  isoDay: 'yyyy-MM-dd',
  isoMonth: 'yyyy-MM',
  day: 'dd',
  dayMonth: 'dd.MM',
} as const;
