import { addMonths, buildMonth, isSelectable, weekNumber, weekdayOrder } from './calendar';
import { dateNames, formatDate, formatTime, parseDate, parseTime } from './date-format';

const names = dateNames('en-US');
const ua = dateNames('uk-UA');
const time = { hourFormat: '24' as const, showSeconds: false, separator: ':', am: 'AM', pm: 'PM' };

describe('date format', () => {
  const date = new Date(2026, 0, 5, 9, 7, 3);

  it('formats every date format token', () => {
    expect(formatDate(date, 'dd.mm.yy', names)).toBe('05.01.2026');
    expect(formatDate(date, 'd/m/y', names)).toBe('5/1/26');
    expect(formatDate(date, 'D, M d', names)).toBe('Mon, Jan 5');
    expect(formatDate(date, 'DD, MM d, yy', names)).toBe('Monday, January 5, 2026');
    expect(formatDate(date, 'o oo', names)).toBe('5 005');
    expect(formatDate(date, "'day' d 'of' MM", names)).toBe('day 5 of January');
    expect(formatDate(date, "d''m", names)).toBe("5'1");
    expect(formatDate(date, '@', names)).toBe(String(date.getTime()));
    expect(formatDate(date, 'dd MM yy', ua)).toBe('05 січня 2026'.replace('січня', ua.monthNames[0]));
    expect(formatDate(null, 'dd', names)).toBe('');
  });

  it('parses what it formats and rejects the rest', () => {
    for (const format of ['dd.mm.yy', 'mm/dd/yy', 'yy-mm-dd', 'd M yy', 'DD, MM d, yy', 'o/yy', '@']) {
      expect(parseDate(formatDate(new Date(2026, 9, 31), format, names), format, names)?.getTime()).toBe(new Date(2026, 9, 31).getTime());
    }
    expect(parseDate('31.02.2026', 'dd.mm.yy', names)).toBeNull();
    expect(parseDate('5.1.2026x', 'dd.mm.yy', names)).toBeNull();
    expect(parseDate('5.1.2026', 'dd.mm.yy', names)?.getDate()).toBe(5);
    expect(parseDate('', 'dd.mm.yy', names)).toBeNull();
    const now = new Date(2026, 5, 1);
    expect(parseDate('01/05/30', 'mm/dd/y', names, '+10', now)?.getFullYear()).toBe(2030);
    expect(parseDate('01/05/45', 'mm/dd/y', names, '+10', now)?.getFullYear()).toBe(1945);
  });

  it('formats and parses times', () => {
    expect(formatTime(date, time)).toBe('09:07');
    expect(formatTime(date, { ...time, showSeconds: true })).toBe('09:07:03');
    expect(formatTime(new Date(2026, 0, 1, 0, 5), { ...time, hourFormat: '12' })).toBe('12:05 AM');
    expect(formatTime(new Date(2026, 0, 1, 13, 5), { ...time, hourFormat: '12' })).toBe('01:05 PM');
    expect(parseTime('9:07', time)).toEqual({ hours: 9, minutes: 7, seconds: 0 });
    expect(parseTime('12:30 am', { ...time, hourFormat: '12' })).toEqual({ hours: 0, minutes: 30, seconds: 0 });
    expect(parseTime('1:05 PM', { ...time, hourFormat: '12' })).toEqual({ hours: 13, minutes: 5, seconds: 0 });
    expect(parseTime('25:00', time)).toBeNull();
    expect(parseTime('1:05', { ...time, hourFormat: '12' })).toBeNull();
  });
});

describe('calendar', () => {
  it('builds weeks from the first day of the week', () => {
    const month = buildMonth(2026, 1, 1, {}, new Date(2026, 1, 11));
    expect(month.weeks).toHaveLength(5);
    expect(month.weeks[0].days[0].date.getDate()).toBe(26);
    expect(month.weeks[2].days.find((day) => day.today)?.day).toBe(11);
    const sunday = buildMonth(2026, 1, 0, {}, new Date());
    expect(sunday.weeks).toHaveLength(4);
    expect(buildMonth(2026, 2, 1, {}, new Date()).weeks).toHaveLength(6);
    expect(buildMonth(2026, 2, 1, {}, new Date()).weeks[0].days[0].otherMonth).toBe(true);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('applies min, max, disabled dates and days', () => {
    const rules = { minDate: new Date(2026, 0, 10), maxDate: new Date(2026, 0, 20), disabledDates: [new Date(2026, 0, 15)], disabledDays: [0] };
    expect(isSelectable(new Date(2026, 0, 9), rules)).toBe(false);
    expect(isSelectable(new Date(2026, 0, 12), rules)).toBe(true);
    expect(isSelectable(new Date(2026, 0, 15), rules)).toBe(false);
    expect(isSelectable(new Date(2026, 0, 18), rules)).toBe(false);
    expect(isSelectable(new Date(2026, 0, 21), rules)).toBe(false);
  });

  it('numbers ISO weeks and moves months without overflow', () => {
    expect(weekNumber(new Date(2026, 0, 1))).toBe(1);
    expect(weekNumber(new Date(2027, 0, 1))).toBe(53);
    expect(weekNumber(new Date(2026, 11, 31))).toBe(53);
    expect(weekNumber(new Date(2026, 0, 4), true)).toBe(2);
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
  });
});
