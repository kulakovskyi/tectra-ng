import {
  ganttArrowHead,
  ganttCellEnd,
  ganttChain,
  ganttDays,
  ganttFitRange,
  ganttFolds,
  ganttLinkPath,
  ganttLinkPaths,
  ganttLinks,
  ganttPack,
  ganttRange,
  ganttRoute,
  ganttRows,
  ganttTaskRange,
  ganttTicks,
  ganttTime,
  ganttX,
} from './gantt-layout';
import { TxGanttSpan } from './gantt-chart.types';
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
    expect(weeks.bottom.map((tick) => tick.label)).toEqual(['', 'Mar 9', 'Mar 16', '']);
    expect(ganttTicks([day(2, 4), day(2, 30)], 'week', 'en-US').bottom.map((tick) => tick.label)).toEqual(['', 'Mar 9', 'Mar 16', 'Mar 23']);
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
    expect(lanes.map((row) => [row.label, row.spans.length, row.lanes])).toEqual([
      ['Design', 2, 1],
      ['Build', 1, 1],
      ['Launch', 1, 1],
    ]);
  });

  it('packs overlapping tasks of a timeline lane into sub-rows', () => {
    const overlapping: TxGanttTask[] = [
      { id: 'a', label: 'A', start: '2026-03-02', end: '2026-03-10', group: 'Sales' },
      { id: 'b', label: 'B', start: '2026-03-05', end: '2026-03-12', group: 'Sales' },
      { id: 'c', label: 'C', start: '2026-03-11', end: '2026-03-13', group: 'Sales' },
      { id: 'd', label: 'D', start: '2026-03-06', end: '2026-03-07', group: 'Sales' },
    ];
    const [row] = ganttRows(overlapping, 'timeline', new Set(), day(2, 1), 10, 4);
    expect(row.lanes).toBe(3);
    expect(row.spans.map((span) => [span.task.id, span.lane])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 0],
      ['d', 2],
    ]);
    const span = (x: number, width: number, index: number, milestone = false): TxGanttSpan => ({ ...row.spans[0], task: { id: `${index}`, label: '', start: 0, milestone }, x, width, index });
    expect(ganttPack([]).lanes).toBe(1);
    expect(ganttPack([span(0, 10, 0), span(10, 0, 1, true), span(10, 5, 2), span(17, 4, 3)]).spans.map((item) => item.lane)).toEqual([0, 1, 0, 0]);
    expect(ganttPack([span(5, 10, 1), span(5, 10, 0)]).spans.map((item) => item.lane)).toEqual([1, 0]);
  });

  it('ends the scale on whole header cells and stretches it to a width', () => {
    expect(ganttCellEnd(day(2, 3), 'day')).toBe(day(2, 3));
    expect(ganttCellEnd(new Date(2026, 2, 3, 12).getTime(), 'day')).toBe(day(2, 4));
    expect(ganttCellEnd(day(2, 4), 'week')).toBe(day(2, 9));
    expect(ganttCellEnd(day(2, 9), 'week')).toBe(day(2, 9));
    expect(ganttCellEnd(new Date(2026, 2, 8, 12).getTime(), 'week')).toBe(day(2, 9));
    expect(ganttCellEnd(day(2, 4), 'month')).toBe(day(3, 1));
    expect(ganttCellEnd(day(3, 1), 'month')).toBe(day(3, 1));
    expect(ganttCellEnd(day(1, 4), 'quarter')).toBe(day(3, 1));
    expect(ganttFitRange([day(2, 1), day(2, 5)], 'day', 0)).toEqual([day(2, 1), day(2, 5)]);
    expect(ganttFitRange([day(2, 1), day(2, 5)], 'day', 400)).toEqual([day(2, 1), day(2, 11)]);
    expect(ganttFitRange([day(0, 1), day(0, 20)], 'quarter', 2000)).toEqual([day(0, 1), new Date(2028, 9, 1).getTime()]);
  });

  it('leaves out header labels wider than their cell', () => {
    const quarter = ganttTicks([day(0, 1), new Date(2027, 0, 5).getTime()], 'quarter', 'en-US');
    expect(quarter.top.map((tick) => tick.label)).toEqual(['2026', '']);
    expect(ganttTicks([day(0, 1), new Date(2027, 3, 1).getTime()], 'quarter', 'en-US').top.map((tick) => tick.label)).toEqual(['2026', '2027']);
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

  it('checks dependencies: unknown ids, self links, repeats and cycles are left out', () => {
    const graph: TxGanttTask[] = [
      { id: 'a', label: 'A', start: '2026-03-02', dependsOn: ['c'] },
      { id: 'b', label: 'B', start: '2026-03-02', dependsOn: ['a'] },
      { id: 'c', label: 'C', start: '2026-03-02', dependsOn: ['b', 'b', 'x', 'c', { id: '' }, { id: 'a', type: 'bogus' as never }] },
      { id: 'd', label: 'D', start: '2026-03-02', dependsOn: [{ id: 'c', type: 'start-to-finish' }], },
      { id: 'e', label: 'E', start: '2026-03-02', dependsOn: null },
    ];
    expect(ganttLinks(graph)).toEqual([
      { from: 'a', to: 'b', type: 'finish-to-start' },
      { from: 'b', to: 'c', type: 'finish-to-start' },
      { from: 'a', to: 'c', type: 'finish-to-start' },
      { from: 'c', to: 'd', type: 'start-to-finish' },
    ]);
    expect(ganttLinks([{ id: 'a', label: 'A', start: 0, dependsOn: ['a'] }])).toEqual([]);
  });

  it('walks the dependency chain of a task both ways', () => {
    const links = ganttLinks([
      { id: 'a', label: 'A', start: 0 },
      { id: 'b', label: 'B', start: 0, dependsOn: ['a'] },
      { id: 'c', label: 'C', start: 0, dependsOn: ['b', 'a', 'd'] },
      { id: 'd', label: 'D', start: 0 },
      { id: 'e', label: 'E', start: 0 },
      { id: 'f', label: 'F', start: 0, dependsOn: ['e'] },
    ]);
    const chain = ganttChain(links, 'b');
    expect([...chain.tasks].sort()).toEqual(['a', 'b', 'c']);
    expect([...chain.links].map((index) => `${links[index].from}>${links[index].to}`).sort()).toEqual(['a>b', 'b>c']);
    expect([...ganttChain(links, 'c').tasks].sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(ganttChain(links, 'c').links.size).toBe(4);
    expect(ganttChain(links, 'x').links.size).toBe(0);
  });

  it('routes every dependency type with stubs out of and into the bar edges', () => {
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 200, y: 1.5, side: 'start' })).toEqual([
      [100, 0.5],
      [108, 0.5],
      [108, 1.5],
      [200, 1.5],
    ]);
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 200, y: 0.5, side: 'start' })).toEqual([
      [100, 0.5],
      [200, 0.5],
    ]);
    expect(ganttRoute({ x: 100, y: 0.5, side: 'start' }, { x: 150, y: 1.5, side: 'start' })).toEqual([
      [100, 0.5],
      [92, 0.5],
      [92, 1.5],
      [150, 1.5],
    ]);
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 80, y: 1.5, side: 'finish' })).toEqual([
      [100, 0.5],
      [108, 0.5],
      [108, 1.5],
      [80, 1.5],
    ]);
    expect(ganttRoute({ x: 100, y: 0.5, side: 'start' }, { x: 50, y: 1.5, side: 'finish' })).toEqual([
      [100, 0.5],
      [92, 0.5],
      [92, 1.5],
      [50, 1.5],
    ]);
  });

  it('goes around through the row gap when the target edge is behind the source stub', () => {
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 90, y: 1.5, side: 'start' })).toEqual([
      [100, 0.5],
      [108, 0.5],
      [108, 1],
      [78, 1],
      [78, 1.5],
      [90, 1.5],
    ]);
    expect(ganttRoute({ x: 100, y: 2.5, side: 'finish' }, { x: 90, y: 0.5, side: 'start' })).toEqual([
      [100, 2.5],
      [108, 2.5],
      [108, 2],
      [78, 2],
      [78, 0.5],
      [90, 0.5],
    ]);
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 90, y: 0.5, side: 'start' })[2]).toEqual([108, 1]);
    expect(ganttRoute({ x: 100, y: 0.5, side: 'start' }, { x: 95, y: 1.5, side: 'finish' })).toEqual([
      [100, 0.5],
      [92, 0.5],
      [92, 1],
      [107, 1],
      [107, 1.5],
      [95, 1.5],
    ]);
  });

  it('picks the route that crosses the fewest bars', () => {
    const box = { x1: 105, x2: 150, y1: 1.2, y2: 1.8 };
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 200, y: 2.5, side: 'start' }, [box])).toEqual([
      [100, 0.5],
      [188, 0.5],
      [188, 2.5],
      [200, 2.5],
    ]);
    const wide = { x1: 0, x2: 400, y1: 1.2, y2: 1.8 };
    const blocked = ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 200, y: 2.5, side: 'start' }, [wide]);
    expect(blocked).toHaveLength(4);
    const lane = { x1: 130, x2: 160, y1: 0.2, y2: 0.8 };
    expect(ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 200, y: 0.5, side: 'start' }, [lane])).toEqual([
      [100, 0.5],
      [108, 0.5],
      [108, 1],
      [188, 1],
      [188, 0.5],
      [200, 0.5],
    ]);
  });

  it('draws a route with rounded corners and an arrowhead along its last segment', () => {
    const points = ganttRoute({ x: 100, y: 0.5, side: 'finish' }, { x: 200, y: 1.5, side: 'start' });
    expect(ganttLinkPath(points)).toBe('M100 0.5 L104 0.5 Q108 0.5 108 0.62 L108 1.38 Q108 1.5 112 1.5 L200 1.5');
    expect(ganttArrowHead(points)).toBe('M200 1.5 L194 1.39 L194 1.61 Z');
    expect(ganttArrowHead([[100, 1.5], [80, 1.5]])).toBe('M80 1.5 L86 1.39 L86 1.61 Z');
    expect(ganttLinkPath([[0, 0], [2, 0], [2, 0.1]])).toBe('M0 0 L1 0 Q2 0 2 0.05 L2 0.1');
    expect(ganttLinkPath([])).toBe('');
    expect(ganttLinkPath([[5, 1]])).toBe('M5 1');
    expect(ganttArrowHead([[5, 1]])).toBe('');
  });

  it('places the arrows on the drawn rows and moves them to the summary of a folded group', () => {
    const plan: TxGanttTask[] = [
      { id: 'a', label: 'A', start: '2026-03-02', end: '2026-03-03', group: 'G' },
      { id: 'b', label: 'B', start: '2026-03-05', end: '2026-03-06', group: 'G', dependsOn: ['a'] },
      { id: 'c', label: 'C', start: '2026-03-09', end: '2026-03-10', group: 'H', dependsOn: ['a', 'b'] },
      { id: 'm', label: 'M', start: '2026-03-12', milestone: true, group: 'H', dependsOn: [{ id: 'c', type: 'finish-to-finish' }] },
    ];
    const links = ganttLinks(plan);
    const open = ganttLinkPaths(links, ganttFolds(ganttRows(plan, 'tasks', new Set(), day(2, 1), 10, 4)));
    expect(open.height).toBe(6);
    expect(open.paths.map((path) => path.links)).toEqual([[0], [1], [2], [3]]);
    expect(open.paths[0].path.startsWith('M30 1.5')).toBe(true);
    expect(open.paths[2].path).toBe('M60 2.5 L64 2.5 Q68 2.5 68 2.62 L68 4.38 Q68 4.5 72 4.5 L80 4.5');
    expect(open.paths[3].path.startsWith('M100 4.5')).toBe(true);
    expect(open.paths[3].path.endsWith('L118 5.5')).toBe(true);
    const folded = ganttLinkPaths(links, ganttFolds(ganttRows(plan, 'tasks', new Set(['G']), day(2, 1), 10, 4)));
    expect(folded.height).toBe(4);
    expect(folded.paths.map((path) => path.links)).toEqual([[1, 2], [3]]);
    expect(folded.paths[0].path.startsWith('M60 0.5')).toBe(true);
    expect(ganttLinkPaths(links, ganttFolds(ganttRows(plan, 'tasks', new Set(['G', 'H']), day(2, 1), 10, 4))).paths).toHaveLength(1);
    const lanes = ganttLinkPaths(links, ganttFolds(ganttRows(plan, 'timeline', new Set(), day(2, 1), 10, 4)));
    expect(lanes.height).toBe(2);
    expect(lanes.paths).toHaveLength(4);
    expect(ganttLinkPaths([{ from: 'a', to: 'zz', type: 'finish-to-start' }], ganttFolds(ganttRows(plan, 'tasks', new Set(), day(2, 1), 10, 4))).paths).toEqual([]);
  });
});
