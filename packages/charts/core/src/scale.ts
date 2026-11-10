import { TxBandScale, TxContinuousScale, TxPointScale, TxRange, TxTimeInterval, TxTimeScale } from './chart.types';

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

export function tickStep(start: number, stop: number, count: number): number {
  const span = Math.abs(stop - start);
  if (!span || count <= 0 || !Number.isFinite(span)) {
    return 0;
  }
  const raw = span / count;
  const power = Math.floor(Math.log10(raw));
  const base = 10 ** power;
  const error = raw / base;
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;
  return factor * base;
}

export function decimalsOf(step: number): number {
  if (!step || !Number.isFinite(step)) {
    return 0;
  }
  return Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
}

function clean(value: number, decimals: number): number {
  const rounded = Number(value.toFixed(Math.min(20, decimals + 2)));
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function niceDomain(min: number, max: number, count = 5): TxRange {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 1];
  }
  if (min === max) {
    if (min === 0) {
      return [0, 1];
    }
    const pad = Math.abs(min) * 0.1 || 1;
    return niceDomain(min > 0 ? 0 : min - pad, max < 0 ? 0 : max + pad, count);
  }
  let start = Math.min(min, max);
  let stop = Math.max(min, max);
  for (let round = 0; round < 3; round++) {
    const step = tickStep(start, stop, count);
    const nextStart = Math.floor(start / step) * step;
    const nextStop = Math.ceil(stop / step) * step;
    if (nextStart === start && nextStop === stop) {
      break;
    }
    start = clean(nextStart, decimalsOf(step));
    stop = clean(nextStop, decimalsOf(step));
  }
  return [start, stop];
}

export function linearTicks(min: number, max: number, count = 5): number[] {
  const step = tickStep(min, max, count);
  if (!step) {
    return Number.isFinite(min) ? [min] : [];
  }
  const decimals = decimalsOf(step);
  const first = Math.ceil(min / step - 1e-9);
  const last = Math.floor(max / step + 1e-9);
  const ticks: number[] = [];
  for (let index = first; index <= last; index++) {
    ticks.push(clean(index * step, decimals));
  }
  return ticks;
}

export function linearScale(domain: TxRange, range: TxRange): TxContinuousScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const map = (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
  return {
    kind: 'linear',
    domain,
    range,
    map,
    invert: (position) => d0 + ((position - r0) / (r1 - r0 || 1)) * span,
    ticks: (count = 5) => linearTicks(d0, d1, count),
  };
}

export function logDomain(min: number, max: number): TxRange {
  const low = Math.max(min, Number.MIN_VALUE);
  const lowPower = Math.floor(Math.log10(low));
  const highPower = Math.ceil(Math.log10(Math.max(max, low)));
  return [10 ** lowPower, 10 ** Math.max(highPower, lowPower + 1)];
}

export function logTicks(min: number, max: number, count = 5): number[] {
  const low = Math.floor(Math.log10(min));
  const high = Math.ceil(Math.log10(max));
  const decades = high - low;
  const steps = decades * 3 <= count ? [1, 2, 5] : [1];
  const every = Math.max(1, Math.ceil(decades / Math.max(1, count)));
  const ticks: number[] = [];
  for (let power = low; power <= high; power++) {
    if ((power - low) % every) {
      continue;
    }
    for (const step of steps) {
      const value = step * 10 ** power;
      if (value >= min * (1 - 1e-9) && value <= max * (1 + 1e-9)) {
        ticks.push(Number(value.toPrecision(12)));
      }
    }
  }
  return ticks;
}

export function logScale(domain: TxRange, range: TxRange): TxContinuousScale {
  const [d0, d1] = domain.map((value) => Math.max(value, Number.MIN_VALUE)) as TxRange;
  const [r0, r1] = range;
  const l0 = Math.log10(d0);
  const span = Math.log10(d1) - l0 || 1;
  return {
    kind: 'log',
    domain: [d0, d1],
    range,
    map: (value) => r0 + ((Math.log10(Math.max(value, d0 / 10)) - l0) / span) * (r1 - r0),
    invert: (position) => 10 ** (l0 + ((position - r0) / (r1 - r0 || 1)) * span),
    ticks: (count = 5) => logTicks(d0, d1, count),
  };
}

export function bandScale(count: number, range: TxRange, paddingInner = 0, paddingOuter = 0): TxBandScale {
  const [r0, r1] = range;
  const slots = Math.max(1, count - paddingInner + paddingOuter * 2);
  const step = (r1 - r0) / slots;
  const bandwidth = step * (1 - paddingInner);
  const start = r0 + step * paddingOuter;
  return {
    kind: 'band',
    count,
    range,
    step,
    bandwidth,
    start: (index) => start + step * index,
    center: (index) => start + step * index + bandwidth / 2,
    indexAt: (position) => Math.min(count - 1, Math.max(0, Math.floor((position - r0) / ((r1 - r0) / Math.max(1, count))))),
  };
}

export function pointScale(count: number, range: TxRange): TxPointScale {
  const [r0, r1] = range;
  const step = count > 1 ? (r1 - r0) / (count - 1) : 0;
  const at = (index: number) => (count > 1 ? r0 + step * index : (r0 + r1) / 2);
  return {
    kind: 'point',
    count,
    range,
    step,
    at,
    indexAt: (position) => (count > 1 ? Math.min(count - 1, Math.max(0, Math.round((position - r0) / step))) : 0),
  };
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const TX_TIME_INTERVALS: readonly TxTimeInterval[] = [
  { unit: 'second', step: 1, duration: SECOND },
  { unit: 'second', step: 5, duration: 5 * SECOND },
  { unit: 'second', step: 15, duration: 15 * SECOND },
  { unit: 'second', step: 30, duration: 30 * SECOND },
  { unit: 'minute', step: 1, duration: MINUTE },
  { unit: 'minute', step: 5, duration: 5 * MINUTE },
  { unit: 'minute', step: 15, duration: 15 * MINUTE },
  { unit: 'minute', step: 30, duration: 30 * MINUTE },
  { unit: 'hour', step: 1, duration: HOUR },
  { unit: 'hour', step: 3, duration: 3 * HOUR },
  { unit: 'hour', step: 6, duration: 6 * HOUR },
  { unit: 'hour', step: 12, duration: 12 * HOUR },
  { unit: 'day', step: 1, duration: DAY },
  { unit: 'day', step: 2, duration: 2 * DAY },
  { unit: 'week', step: 1, duration: 7 * DAY },
  { unit: 'month', step: 1, duration: 30 * DAY },
  { unit: 'month', step: 2, duration: 61 * DAY },
  { unit: 'month', step: 3, duration: 91 * DAY },
  { unit: 'month', step: 6, duration: 182 * DAY },
  { unit: 'year', step: 1, duration: 365 * DAY },
];

export function timeInterval(start: number, stop: number, count = 6): TxTimeInterval {
  const span = Math.abs(stop - start);
  const target = span / Math.max(1, count);
  const found = TX_TIME_INTERVALS.find((interval) => interval.duration >= target);
  if (found) {
    return found;
  }
  const years = tickStep(0, span / (365 * DAY), count) || 1;
  return { unit: 'year', step: Math.max(1, Math.round(years)), duration: Math.max(1, Math.round(years)) * 365 * DAY };
}

export function floorTime(time: number, interval: TxTimeInterval): Date {
  const date = new Date(time);
  const { unit, step } = interval;
  if (unit === 'year') {
    return new Date(Math.floor(date.getFullYear() / step) * step, 0, 1);
  }
  if (unit === 'month') {
    return new Date(date.getFullYear(), Math.floor(date.getMonth() / step) * step, 1);
  }
  if (unit === 'week') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  }
  if (unit === 'day') {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return step > 1 ? new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDate() - 1) % step)) : day;
  }
  if (unit === 'hour') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(date.getHours() / step) * step);
  }
  if (unit === 'minute') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), Math.floor(date.getMinutes() / step) * step);
  }
  return new Date(Math.floor(time / (step * SECOND)) * step * SECOND);
}

export function addTime(date: Date, interval: TxTimeInterval): Date {
  const { unit, step } = interval;
  const next = new Date(date.getTime());
  if (unit === 'year') next.setFullYear(next.getFullYear() + step);
  else if (unit === 'month') next.setMonth(next.getMonth() + step);
  else if (unit === 'week') next.setDate(next.getDate() + 7 * step);
  else if (unit === 'day') next.setDate(next.getDate() + step);
  else if (unit === 'hour') next.setHours(next.getHours() + step);
  else if (unit === 'minute') next.setMinutes(next.getMinutes() + step);
  else next.setSeconds(next.getSeconds() + step);
  return next;
}

export function timeTicks(start: number, stop: number, count = 6): { ticks: number[]; interval: TxTimeInterval } {
  const interval = timeInterval(start, stop, count);
  const ticks: number[] = [];
  let tick = floorTime(start, interval);
  if (tick.getTime() < start) {
    tick = addTime(tick, interval);
  }
  while (tick.getTime() <= stop && ticks.length < 1000) {
    ticks.push(tick.getTime());
    tick = addTime(tick, interval);
  }
  return { ticks, interval };
}

export function timeScale(domain: TxRange, range: TxRange): TxTimeScale {
  const linear = linearScale(domain, range);
  return {
    ...linear,
    kind: 'time',
    ticks: (count = 6) => timeTicks(domain[0], domain[1], count).ticks,
    interval: (count = 6) => timeInterval(domain[0], domain[1], count),
  };
}

export function toTime(value: string | number | Date | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const time = dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime() : Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

export function extent(values: Iterable<number | null | undefined>): TxRange | null {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      continue;
    }
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return min === Infinity ? null : [min, max];
}
