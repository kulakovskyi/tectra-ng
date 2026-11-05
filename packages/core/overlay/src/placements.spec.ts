import { fitsInBounds, orderByRoom, parsePlacement, placementFromPosition, toPlacement, txArrowOffset, txPositions } from './placements';

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

describe('orderByRoom', () => {
  const origin = { top: 120, left: 400, width: 40, height: 30 };
  const size = { width: 80, height: 30 };

  it('keeps the wanted placement while it has room', () => {
    const bounds = { top: 8, right: 1432, bottom: 512, left: 8 };
    expect(placementFromPosition(orderByRoom(txPositions('top', 8), origin, size, bounds)[0])).toBe('top');
  });

  it('moves the first placement that clears sticky chrome to the front', () => {
    const bounds = { top: 118, right: 1432, bottom: 512, left: 8 };
    expect(fitsInBounds(txPositions('top', 8)[0], origin, size, bounds)).toBe(false);
    expect(orderByRoom(txPositions('top', 8), origin, size, bounds).map(placementFromPosition).slice(0, 2)).toEqual(['bottom', 'top']);
  });

  it('leaves the order alone when nothing fits', () => {
    const positions = txPositions('top', 8);
    expect(orderByRoom(positions, origin, size, { top: 140, right: 1432, bottom: 160, left: 8 })).toBe(positions);
  });

  it('points the arrow at the middle of a centred origin and near the edge of an aligned one', () => {
    const origin = { width: 96, height: 37 };
    expect(txArrowOffset('bottom', origin, 'var(--inset)')).toBe('50%');
    expect(txArrowOffset('top-start', origin, 'var(--inset)')).toBe('min(var(--inset), 48px)');
    expect(txArrowOffset('bottom-end', origin, 'var(--inset)')).toBe('calc(100% - min(var(--inset), 48px))');
    expect(txArrowOffset('right-start', origin)).toBe('18.5px');
  });
});
