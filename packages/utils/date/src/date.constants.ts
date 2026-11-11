export const MS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;
export const MONTHS_IN_YEAR = 12;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
export const MS_IN_MINUTE = MS_IN_SECOND * SECONDS_IN_MINUTE;
export const MS_IN_HOUR = MS_IN_MINUTE * MINUTES_IN_HOUR;
export const MS_IN_DAY = MS_IN_HOUR * HOURS_IN_DAY;
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
