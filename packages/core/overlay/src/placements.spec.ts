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
    const positions = txPositions('bottom');
    expect(positions.map(placementFromPosition)).toEqual(['bottom', 'top', 'bottom-start', 'bottom-end', 'top-start', 'top-end']);
  });

  it('falls back to the top and bottom when a side placement has no room on a narrow screen', () => {
    const positions = txPositions('right');
    expect(positions.map(placementFromPosition)).toEqual([
      'right', 'left', 'right-start', 'right-end', 'left-start', 'left-end',
      'bottom', 'top', 'bottom-start', 'bottom-end', 'top-start', 'top-end',
    ]);
    const origin = { top: 300, left: 100, width: 57, height: 37 };
    const phone = { top: 8, right: 394, bottom: 706, left: 8 };
    const ordered = orderByRoom(positions, origin, { width: 260, height: 70 }, phone);
    expect(placementFromPosition(ordered[0])).toBe('bottom-start');
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
    const shifted = (point: string) => `calc(${point} - var(--tx-overlay-shift, 0px))`;
    expect(txArrowOffset('bottom', origin, 'var(--inset)')).toBe(shifted('50%'));
    expect(txArrowOffset('top-start', origin, 'var(--inset)')).toBe(shifted('min(var(--inset), 48px)'));
    expect(txArrowOffset('bottom-end', origin, 'var(--inset)')).toBe(shifted('100% - min(var(--inset), 48px)'));
    expect(txArrowOffset('right-start', origin)).toBe(shifted('18.5px'));
  });
});

describe('placementFromPosition', () => {
  it('reads the placement from the first panel class and ignores foreign positions', () => {
    const position = { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' } as const;
    expect(placementFromPosition({ ...position, panelClass: ['tx-placement-left-end', 'own'] })).toBe('left-end');
    expect(placementFromPosition({ ...position, panelClass: 'own' })).toBeNull();
    expect(placementFromPosition(position)).toBeNull();
  });
});
