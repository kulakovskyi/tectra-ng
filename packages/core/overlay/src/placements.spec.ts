import { parsePlacement, placementFromPosition, toPlacement, txPositions } from './placements';

describe('placements', () => {
  it('parses and builds placement names', () => {
    expect(parsePlacement('top')).toEqual({ side: 'top', align: 'center' });
    expect(parsePlacement('left-end')).toEqual({ side: 'left', align: 'end' });
    expect(toPlacement('bottom', 'center')).toBe('bottom');
    expect(toPlacement('right', 'start')).toBe('right-start');
  });

  it('puts the wanted placement first and the flipped side second', () => {
    const [first, second] = txPositions('bottom-start', 8);
    expect(first).toMatchObject({ originY: 'bottom', overlayY: 'top', originX: 'start', offsetY: 8 });
    expect(second).toMatchObject({ originY: 'top', overlayY: 'bottom', originX: 'start', offsetY: -8 });
  });

  it('covers every alignment on both sides', () => {
    const positions = txPositions('right');
    expect(positions).toHaveLength(6);
    expect(positions.map(placementFromPosition)).toEqual(['right', 'left', 'right-start', 'right-end', 'left-start', 'left-end']);
  });
});
