import {
  addTime,
  bandScale,
  floorTime,
  extent,
  linearScale,
  linearTicks,
  logDomain,
  logScale,
  logTicks,
  niceDomain,
  pointScale,
  tickStep,
  timeInterval,
  timeScale,
  timeTicks,
  toTime,
} from './scale';

describe('chart scales', () => {
  it('picks 1-2-5 tick steps', () => {
    expect(tickStep(0, 100, 5)).toBe(20);
    expect(tickStep(0, 1, 5)).toBe(0.2);
    expect(tickStep(0, 9800, 6)).toBe(2000);
    expect(tickStep(0, 0, 5)).toBe(0);
  });

  it('makes nice domains around the data', () => {
    expect(niceDomain(3, 97, 5)).toEqual([0, 100]);
    expect(niceDomain(-12, 48, 5)).toEqual([-20, 50]);
    expect(niceDomain(0.12, 0.87, 5)).toEqual([0, 1]);
    expect(niceDomain(5, 5)).toEqual([0, 6]);
    expect(niceDomain(0, 0)).toEqual([0, 1]);
    expect(niceDomain(Number.NaN, 4)).toEqual([0, 1]);
  });

  it('lists round ticks without float noise', () => {
    expect(linearTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(linearTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(linearTicks(-20, 60, 4)).toEqual([-20, 0, 20, 40, 60]);
  });

  it('maps and inverts a linear scale', () => {
    const scale = linearScale([0, 100], [300, 0]);
    expect(scale.map(0)).toBe(300);
    expect(scale.map(50)).toBe(150);
    expect(scale.invert(75)).toBe(75);
    expect(scale.ticks(2)).toEqual([0, 50, 100]);
  });

  it('builds log domains and ticks', () => {
    expect(logDomain(3, 4200)).toEqual([1, 10000]);
    expect(logTicks(1, 10000, 5)).toEqual([1, 10, 100, 1000, 10000]);
    expect(logTicks(1, 100, 6)).toEqual([1, 2, 5, 10, 20, 50, 100]);
    const scale = logScale([1, 1000], [0, 300]);
    expect(scale.map(10)).toBeCloseTo(100);
    expect(scale.invert(200)).toBeCloseTo(100);
  });

  it('splits a range into bands and points', () => {
    const band = bandScale(4, [0, 400]);
    expect(band.step).toBe(100);
    expect(band.center(2)).toBe(250);
    expect(band.indexAt(399)).toBe(3);
    const padded = bandScale(2, [0, 100], 0.2, 0.1);
    expect(padded.bandwidth).toBeCloseTo(padded.step * 0.8);
    const points = pointScale(5, [0, 400]);
    expect(points.at(0)).toBe(0);
    expect(points.at(4)).toBe(400);
    expect(points.indexAt(160)).toBe(2);
    expect(pointScale(1, [0, 100]).at(0)).toBe(50);
  });

  it('picks calendar intervals and ticks', () => {
    const start = new Date(2026, 0, 1).getTime();
    const end = new Date(2026, 11, 31).getTime();
    const { ticks, interval } = timeTicks(start, end, 6);
    expect(interval).toMatchObject({ unit: 'month', step: 2 });
    expect(ticks.map((tick) => new Date(tick).getMonth())).toEqual([0, 2, 4, 6, 8, 10]);
    expect(timeInterval(0, 3_600_000, 6).unit).toBe('minute');
    expect(timeInterval(0, 40 * 365 * 86_400_000, 6)).toMatchObject({ unit: 'year', step: 5 });
  });

  it('reads dates', () => {
    expect(toTime('2026-03-02')).toBe(new Date(2026, 2, 2).getTime());
    expect(toTime(new Date(5))).toBe(5);
    expect(toTime(12)).toBe(12);
    expect(toTime('nope')).toBeNull();
    expect(toTime('')).toBeNull();
    expect(toTime(null)).toBeNull();
  });

  it('finds the extent of finite values', () => {
    expect(extent([3, null, -2, Number.NaN, 8])).toEqual([-2, 8]);
    expect(extent([null])).toBeNull();
  });

  it('pads a single value away from zero and drops negative zero', () => {
    expect(niceDomain(-5, -5)).toEqual([-6, 0]);
    expect(niceDomain(Number.MIN_VALUE, Number.MIN_VALUE)).toEqual([0, 1]);
    expect(Object.is(linearTicks(-0.5, 2, 2)[0], 0)).toBe(true);
    expect(linearTicks(3, 3)).toEqual([3]);
    expect(linearTicks(Number.NaN, Number.NaN)).toEqual([]);
  });

  it('keeps flat domains and ranges usable', () => {
    const flat = linearScale([5, 5], [0, 0]);
    expect(flat.map(6)).toBe(0);
    expect(flat.invert(10)).toBe(15);
    const log = logScale([10, 10], [0, 0]);
    expect(log.map(10)).toBe(0);
    expect(log.invert(0)).toBe(10);
    expect(logTicks(1, 1e10, 2)).toEqual([1, 100000, 10000000000]);
    expect(bandScale(3, [0, 300]).start(1)).toBe(100);
    expect(pointScale(1, [0, 100]).indexAt(80)).toBe(0);
  });

  it('floors and steps every calendar unit', () => {
    const at = new Date(2026, 4, 14, 13, 47, 33, 500).getTime();
    const unit = (
      name: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second',
      step: number,
    ) => ({ unit: name, step, duration: 1 });
    expect(floorTime(at, unit('year', 5))).toEqual(new Date(2025, 0, 1));
    expect(floorTime(at, unit('week', 1)).getDay()).toBe(0);
    expect(floorTime(at, unit('day', 1))).toEqual(new Date(2026, 4, 14));
    expect(floorTime(at, unit('day', 2))).toEqual(new Date(2026, 4, 13));
    expect(floorTime(at, unit('hour', 6))).toEqual(new Date(2026, 4, 14, 12));
    expect(floorTime(at, unit('minute', 15))).toEqual(new Date(2026, 4, 14, 13, 45));
    expect(floorTime(at, unit('second', 5)).getSeconds()).toBe(30);
    const start = new Date(2026, 0, 31, 10, 0, 0);
    expect(addTime(start, unit('year', 2)).getFullYear()).toBe(2028);
    expect(addTime(start, unit('week', 1)).getDate()).toBe(7);
    expect(addTime(start, unit('day', 2)).getDate()).toBe(2);
    expect(addTime(start, unit('hour', 3)).getHours()).toBe(13);
    expect(addTime(start, unit('minute', 5)).getMinutes()).toBe(5);
    expect(addTime(start, unit('second', 30)).getSeconds()).toBe(30);
  });

  it('starts time ticks at the first boundary inside the range and falls back to whole years', () => {
    const start = new Date(2026, 0, 1, 0, 0, 20).getTime();
    const { ticks } = timeTicks(start, start + 60_000, 4);
    expect(ticks[0]).toBeGreaterThanOrEqual(start);
    expect(timeInterval(0, 1e15, 0)).toMatchObject({ unit: 'year', step: 1 });
    const scale = timeScale([start, start + 86_400_000], [0, 100]);
    expect(scale.kind).toBe('time');
    expect(scale.interval().unit).toBe('hour');
    expect(scale.ticks(4).length).toBeGreaterThan(1);
    expect(toTime(new Date(Number.NaN))).toBeNull();
    expect(toTime(Number.POSITIVE_INFINITY)).toBeNull();
    expect(toTime(undefined)).toBeNull();
  });
});
