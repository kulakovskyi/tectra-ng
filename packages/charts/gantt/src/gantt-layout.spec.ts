import { ganttDays, ganttFolds, ganttRange, ganttRows, ganttTaskRange, ganttTicks, ganttTime, ganttX } from './gantt-layout';
import { TxGanttTask } from './gantt-chart.types';

const day = (month: number, date: number) => new Date(2026, month, date).getTime();

const tasks: TxGanttTask[] = [
  { id: 'a', label: 'Brief', start: '2026-03-02', end: '2026-03-04', group: 'Design', progress: 100 },
  { id: 'b', label: 'Mockups', start: '2026-03-05', end: '2026-03-11', group: 'Design', progress: 40 },
  { id: 'c', label: 'API', start: '2026-03-09', end: '2026-03-20', group: 'Build' },
  { id: 'd', label: 'Launch', start: '2026-03-23', milestone: true },
];

describe('gantt layout', () => {
  it('reads date-only ends as whole days and milestones as points', () => {
    expect(ganttTime('2026-03-04', true)).toBe(day(2, 5));
    expect(ganttTime(new Date(2026, 2, 4, 12))).toBe(new Date(2026, 2, 4, 12).getTime());
    expect(ganttTaskRange(tasks[0])).toEqual([day(2, 2), day(2, 5)]);
    expect(ganttTaskRange(tasks[3])).toEqual([day(2, 23), day(2, 23)]);
    expect(ganttTaskRange({ id: 'x', label: 'x', start: '2026-03-02' })).toEqual([day(2, 2), day(2, 3)]);
    expect(ganttTaskRange({ id: 'x', label: 'x', start: 'nope' })).toBeNull();
    expect(ganttDays(day(2, 2), day(2, 5))).toBe(3);
  });

  it('pads the range by whole days and maps dates to pixels', () => {
    const range = ganttRange(tasks, 2);
    expect(range).toEqual([day(1, 28), day(2, 25)]);
    expect(ganttX(day(2, 2), range[0], 10)).toBe(20);
    expect(ganttRange([], 0, '2026-01-10', '2026-01-12')).toEqual([day(0, 10), day(0, 13)]);
  });

  it('builds two header tiers for every zoom', () => {
    const range: [number, number] = [day(2, 28), day(3, 3)];
    const days = ganttTicks(range, 'day', 'en-US');
    expect(days.top.map((tick) => tick.label)).toEqual(['March 2026', 'April 2026']);
    expect(days.bottom.map((tick) => tick.label)).toEqual(['28', '29', '30', '31', '1', '2']);
    expect(days.bottom.filter((tick) => tick.weekend).map((tick) => tick.label)).toEqual(['28', '29']);
    expect(days.top[0].width).toBe(4 * 40);
    const weeks = ganttTicks([day(2, 4), day(2, 24)], 'week', 'en-US');
    expect(weeks.bottom.map((tick) => tick.label)).toEqual(['', 'Mar 9', 'Mar 16', 'Mar 23']);
    expect(ganttTicks([day(0, 1), day(11, 31)], 'month', 'en-US').bottom).toHaveLength(12);
    expect(ganttTicks([day(0, 1), day(11, 31)], 'quarter', 'en-US').bottom.map((tick) => tick.label)).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
  });

  it('puts tasks under group rows, folds a group and lays lanes for a timeline', () => {
    const start = day(2, 1);
    const rows = ganttRows(tasks, 'tasks', new Set(), start, 10, 4);
    expect(rows.map((row) => `${row.kind}:${row.label}`)).toEqual(['task:Launch', 'group:Design', 'task:Brief', 'task:Mockups', 'group:Build', 'task:API']);
    expect(rows[1].summary).toEqual({ x: 10, width: 100 });
    expect(rows[0].spans[0].width).toBe(0);
    expect(rows[2].spans[0].color).not.toBe(rows[5].spans[0].color);
    const folded = ganttRows(tasks, 'tasks', new Set(['Design']), start, 10, 4);
    expect(folded.map((row) => [row.label, row.collapsed])).toEqual([
      ['Launch', false],
      ['Design', true],
      ['Brief', true],
      ['Mockups', true],
      ['Build', false],
      ['API', false],
    ]);
    const lanes = ganttRows(tasks, 'timeline', new Set(), start, 10, 4);
    expect(lanes.map((row) => [row.label, row.spans.length])).toEqual([
      ['Design', 2],
      ['Build', 1],
      ['Launch', 1],
    ]);
  });

  it('wraps the tasks of each group in a fold under its group row', () => {
    const start = day(2, 1);
    const folds = ganttFolds(ganttRows(tasks, 'tasks', new Set(['Design']), start, 10, 4));
    expect(folds.map((fold) => [fold.head?.label ?? null, fold.collapsed, fold.rows.map((row) => row.label)])).toEqual([
      [null, false, ['Launch']],
      ['Design', true, ['Brief', 'Mockups']],
      ['Build', false, ['API']],
    ]);
    const lanes = ganttFolds(ganttRows(tasks, 'timeline', new Set(['Design']), start, 10, 4));
    expect(lanes.map((fold) => [fold.head, fold.collapsed, fold.rows.length])).toEqual([[null, false, 3]]);
  });

  it('keeps a group without dated tasks bare and pads partial and Sunday ranges', () => {
    const rows = ganttRows([{ id: 'x', label: 'Draft', start: 'nope', group: 'Ideas' }], 'tasks', new Set(), day(2, 1), 10, 4);
    expect(rows).toEqual([expect.objectContaining({ kind: 'group', label: 'Ideas', summary: null, count: 0 })]);
    expect(ganttRange([{ id: 'x', label: 'x', start: new Date(2026, 2, 2), end: new Date(2026, 2, 4, 12) }], 0)).toEqual([day(2, 2), day(2, 5)]);
    expect(ganttTicks([day(2, 1), day(2, 15)], 'week', 'en-US').bottom.map((tick) => tick.label)).toEqual(['', 'Mar 2', 'Mar 9']);
  });
});
