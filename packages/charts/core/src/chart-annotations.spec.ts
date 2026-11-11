import { chartAnnotationShapes, chartCategoryIndex } from './chart-annotations';

const plot = { left: 40, top: 10, width: 200, height: 100 };
const mapping = { plot, x: (value: unknown) => (typeof value === 'number' ? 40 + value * 20 : null), xSpan: (value: unknown) => (typeof value === 'number' ? ([30 + value * 20, 50 + value * 20] as [number, number]) : null), y: (value: number) => 110 - value };

describe('chart annotations', () => {
  it('turns lines, bands and points into shapes inside the plot', () => {
    const shapes = chartAnnotationShapes(
      [
        { type: 'x-line', x: 2, label: 'Release' },
        { type: 'y-line', y: 50, label: 'Target', tone: 'danger' },
        { type: 'x-band', from: 3, to: 5, label: 'Sale' },
        { type: 'y-band', from: 20, to: 40, color: 'red' },
        { type: 'point', x: 4, y: 70, label: 'Peak' },
        { type: 'x-line', x: 'missing' },
        { type: 'y-line', y: 500 },
      ],
      mapping,
    );
    expect(shapes.map((shape) => shape.kind)).toEqual(['line', 'line', 'band', 'band', 'point']);
    expect(shapes[0]).toMatchObject({ x1: 80, y1: 10, x2: 80, y2: 110, color: 'var(--tx-chart-annotation-neutral-color)' });
    expect(shapes[0].label).toMatchObject({ text: 'Release', x: 84, y: 14 });
    expect(shapes[1]).toMatchObject({ x1: 40, y1: 60, x2: 240, y2: 60, color: 'var(--tx-chart-annotation-danger-color)' });
    expect(shapes[1].label?.x).toBeLessThanOrEqual(240);
    expect(shapes[2]).toMatchObject({ x1: 90, x2: 150 });
    expect(shapes[3]).toMatchObject({ y1: 70, y2: 90, color: 'red', label: null });
    expect(shapes[4]).toMatchObject({ x1: 120, y1: 40 });
  });

  it('swaps the axes of a horizontal chart and finds categories by label', () => {
    const [line] = chartAnnotationShapes([{ type: 'x-line', x: 1 }], { ...mapping, horizontal: true });
    expect(line).toMatchObject({ x1: 40, y1: 60, x2: 240, y2: 60 });
    expect(chartCategoryIndex('Tue', ['Mon', 'Tue'])).toBe(1);
    expect(chartCategoryIndex(5, ['Mon', 'Tue'])).toBe(-1);
  });
});
