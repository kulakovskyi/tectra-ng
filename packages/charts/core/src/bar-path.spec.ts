import { barPath } from './bar-path';

describe('barPath', () => {
  const rect = { x: 10, y: 20, width: 30, height: 40 };

  it('rounds the two corners of one end in the shape itself', () => {
    expect(barPath(rect, 'top', 5)).toBe('M10,60V25A5,5 0 0 1 15,20H35A5,5 0 0 1 40,25V60Z');
    expect(barPath(rect, 'bottom', 5)).toBe('M10,20V55A5,5 0 0 0 15,60H35A5,5 0 0 0 40,55V20Z');
    expect(barPath(rect, 'right', 5)).toBe('M10,20H35A5,5 0 0 1 40,25V55A5,5 0 0 1 35,60H10Z');
    expect(barPath(rect, 'left', 5)).toBe('M40,20H15A5,5 0 0 0 10,25V55A5,5 0 0 0 15,60H40Z');
  });

  it('rounds all four corners', () => {
    expect(barPath(rect, 'all', 5)).toBe('M15,20H35A5,5 0 0 1 40,25V55A5,5 0 0 1 35,60H15A5,5 0 0 1 10,55V25A5,5 0 0 1 15,20Z');
    expect(barPath({ x: 0, y: 0, width: 40, height: 4 }, 'all', 10)).toBe('M2,0H38A2,2 0 0 1 40,2V2A2,2 0 0 1 38,4H2A2,2 0 0 1 0,2V2A2,2 0 0 1 2,0Z');
  });

  it('keeps square corners without an end or a radius and shrinks the radius to fit', () => {
    const square = 'M10,20H40V60H10Z';
    expect(barPath(rect, null, 5)).toBe(square);
    expect(barPath(rect, 'top')).toBe(square);
    expect(barPath(rect, 'all', -3)).toBe(square);
    expect(barPath({ x: 0, y: 0, width: 6, height: 40 }, 'top', 10)).toBe('M0,40V3A3,3 0 0 1 3,0H3A3,3 0 0 1 6,3V40Z');
    expect(barPath({ x: 0, y: 0, width: 40, height: 2 }, 'top', 10)).toBe('M0,2V2A2,2 0 0 1 2,0H38A2,2 0 0 1 40,2V2Z');
    expect(barPath({ x: 0, y: 0, width: 2, height: 40 }, 'right', 10)).toBe('M0,0H0A2,2 0 0 1 2,2V38A2,2 0 0 1 0,40H0Z');
    expect(barPath({ x: 0.123, y: 0, width: 10, height: 10 }, null)).toBe('M0.12,0H10.12V10H0.12Z');
  });
});
