export type TxChartCurve = 'smooth' | 'straight' | 'step';

export interface TxXY {
  x: number;
  y: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

const pair = (point: TxXY) => `${round(point.x)},${round(point.y)}`;

function slope(a: TxXY, b: TxXY): number {
  const dx = b.x - a.x;
  return dx ? (b.y - a.y) / dx : 0;
}

function sign(value: number): number {
  return value < 0 ? -1 : 1;
}

export function monotoneTangents(points: readonly TxXY[]): number[] {
  const count = points.length;
  if (count < 2) {
    return points.map(() => 0);
  }
  const slopes = points.slice(1).map((point, index) => slope(points[index], point));
  const tangents = new Array<number>(count);
  tangents[0] = slopes[0];
  tangents[count - 1] = slopes[count - 2];
  for (let index = 1; index < count - 1; index++) {
    const before = slopes[index - 1];
    const after = slopes[index];
    if (before * after <= 0) {
      tangents[index] = 0;
      continue;
    }
    const h0 = points[index].x - points[index - 1].x;
    const h1 = points[index + 1].x - points[index].x;
    const weighted = (before * h1 + after * h0) / (h0 + h1);
    tangents[index] = (sign(before) + sign(after)) * Math.min(Math.abs(before), Math.abs(after), 0.5 * Math.abs(weighted));
  }
  return tangents;
}

function segment(points: readonly TxXY[], curve: TxChartCurve, move: boolean): string {
  if (!points.length) {
    return '';
  }
  const start = `${move ? 'M' : 'L'}${pair(points[0])}`;
  if (points.length === 1) {
    return start;
  }
  if (curve === 'straight') {
    return start + points.slice(1).map((point) => `L${pair(point)}`).join('');
  }
  if (curve === 'step') {
    return (
      start +
      points
        .slice(1)
        .map((point, index) => {
          const middle = (points[index].x + point.x) / 2;
          return `H${round(middle)}V${round(point.y)}H${round(point.x)}`;
        })
        .join('')
    );
  }
  const tangents = monotoneTangents(points);
  return (
    start +
    points
      .slice(1)
      .map((point, index) => {
        const previous = points[index];
        const third = (point.x - previous.x) / 3;
        const c1 = { x: previous.x + third, y: previous.y + third * tangents[index] };
        const c2 = { x: point.x - third, y: point.y - third * tangents[index + 1] };
        return `C${pair(c1)} ${pair(c2)} ${pair(point)}`;
      })
      .join('')
  );
}

export function splitGaps(points: readonly (TxXY | null)[]): TxXY[][] {
  const runs: TxXY[][] = [];
  let run: TxXY[] = [];
  for (const point of points) {
    if (point) {
      run.push(point);
    } else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) {
    runs.push(run);
  }
  return runs;
}

export function linePath(points: readonly (TxXY | null)[], curve: TxChartCurve = 'smooth'): string {
  return splitGaps(points)
    .map((run) => segment(run, curve, true))
    .join('');
}

export function areaPath(top: readonly (TxXY | null)[], bottom: readonly (TxXY | null)[], curve: TxChartCurve = 'smooth'): string {
  const runs: { top: TxXY[]; bottom: TxXY[] }[] = [];
  let current: { top: TxXY[]; bottom: TxXY[] } | null = null;
  top.forEach((point, index) => {
    const base = bottom[index];
    if (point && base) {
      current ??= { top: [], bottom: [] };
      current.top.push(point);
      current.bottom.push(base);
    } else if (current) {
      runs.push(current);
      current = null;
    }
  });
  if (current) {
    runs.push(current);
  }
  return runs
    .filter((run) => run.top.length > 1)
    .map((run) => `${segment(run.top, curve, true)}${segment([...run.bottom].reverse(), curve, false)}Z`)
    .join('');
}
