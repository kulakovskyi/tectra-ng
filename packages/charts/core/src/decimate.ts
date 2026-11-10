export interface TxDecimatePoint {
  x: number;
  y: number;
  index: number;
}

export function largestTriangleThreeBuckets(points: readonly TxDecimatePoint[], threshold: number): TxDecimatePoint[] {
  const count = points.length;
  if (threshold >= count || threshold < 3) {
    return [...points];
  }
  const sampled: TxDecimatePoint[] = [points[0]];
  const every = (count - 2) / (threshold - 2);
  let anchor = 0;
  for (let bucket = 0; bucket < threshold - 2; bucket++) {
    const nextStart = Math.floor((bucket + 1) * every) + 1;
    const nextEnd = Math.min(count, Math.floor((bucket + 2) * every) + 1);
    let averageX = 0;
    let averageY = 0;
    const nextLength = Math.max(1, nextEnd - nextStart);
    for (let index = nextStart; index < nextEnd; index++) {
      averageX += points[index].x;
      averageY += points[index].y;
    }
    averageX /= nextLength;
    averageY /= nextLength;

    const start = Math.floor(bucket * every) + 1;
    const end = Math.floor((bucket + 1) * every) + 1;
    const a = points[anchor];
    let largest = -1;
    let chosen = start;
    for (let index = start; index < end; index++) {
      const area = Math.abs((a.x - averageX) * (points[index].y - a.y) - (a.x - points[index].x) * (averageY - a.y));
      if (area > largest) {
        largest = area;
        chosen = index;
      }
    }
    sampled.push(points[chosen]);
    anchor = chosen;
  }
  sampled.push(points[count - 1]);
  return sampled;
}

export function decimateSeries(points: readonly ({ x: number; y: number } | null)[], threshold: number): (TxDecimatePoint | null)[] {
  if (points.length <= threshold) {
    return points.map((point, index) => (point ? { ...point, index } : null));
  }
  const result: (TxDecimatePoint | null)[] = [];
  let run: TxDecimatePoint[] = [];
  const share = threshold / points.length;
  const flush = () => {
    if (run.length) {
      result.push(...largestTriangleThreeBuckets(run, Math.max(3, Math.round(run.length * share))));
      run = [];
    }
  };
  points.forEach((point, index) => {
    if (point) {
      run.push({ ...point, index });
    } else {
      flush();
      result.push(null);
    }
  });
  flush();
  return result;
}
