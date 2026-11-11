import { sunburstArcAt, sunburstArcs, sunburstFocus, sunburstValue } from './sunburst-layout';
import { TxSunburstItem } from './sunburst-chart.types';

const data: TxSunburstItem[] = [
  { label: 'Europe', children: [{ label: 'France', value: 30 }, { label: 'Spain', value: 10, children: [{ label: 'Madrid', value: 6 }, { label: 'Seville', value: 4 }] }] },
  { label: 'Asia', value: 60, color: 'red', children: [{ label: 'Japan', value: 20 }] },
];

describe('sunburst layout', () => {
  it('sums children unless a value is given', () => {
    expect(sunburstValue(data[0])).toBe(40);
    expect(sunburstValue(data[1])).toBe(60);
    expect(sunburstFocus(data, [0, 1]).items.map((item) => item.label)).toEqual(['Madrid', 'Seville']);
  });

  it('splits the circle by value ring after ring', () => {
    const arcs = sunburstArcs(data, { levels: 3, radius: 100, hole: 0.4, focus: [] });
    const arc = (key: string) => arcs.find((item) => item.key === key) ?? fail(key);
    expect(arc('0').end - arc('0').start).toBeCloseTo((Math.PI * 2 * 40) / 100);
    expect([arc('0').inner, arc('0').outer]).toEqual([40, 60]);
    expect([arc('0.1.0').inner, arc('0.1.0').outer]).toEqual([80, 100]);
    expect(arc('0.0').end - arc('0.0').start).toBeCloseTo((arc('0').end - arc('0').start) * 0.75);
    expect(arc('1.0').end - arc('1.0').start).toBeCloseTo((arc('1').end - arc('1').start) * (20 / 60));
    expect(arc('1').base).toBe('red');
    expect(arc('1.0').base).toBe('red');
    expect(arc('0').base).toBe(arc('0.1.1').base);
    expect(arc('0.1').hasChildren).toBe(true);
    expect(arc('0.1').share).toBeCloseTo(0.1);
  });

  it('drills into a branch and keeps its colour', () => {
    const arcs = sunburstArcs(data, { levels: 2, radius: 100, hole: 0.5, focus: [1] });
    expect(arcs.map((arc) => [arc.key, arc.depth])).toEqual([['1.0', 1]]);
    expect(arcs[0].end - arcs[0].start).toBeCloseTo((Math.PI * 2) / 3);
    expect(arcs[0].base).toBe('red');
  });

  it('finds the arc under a point', () => {
    const arcs = sunburstArcs(data, { levels: 3, radius: 100, hole: 0.4, focus: [] });
    expect(sunburstArcAt(arcs, 150, 50 - 50, 150, 150)).toBeNull();
    expect(sunburstArcAt(arcs, 155, 100, 150, 150)?.key).toBe('0');
    expect(sunburstArcAt(arcs, 150, 150, 150, 150)).toBeNull();
  });
});

function fail(name: string): never {
  throw new Error(`missing ${name}`);
}
