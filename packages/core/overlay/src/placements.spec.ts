import {
  fitsInBounds,
  orderByRoom,
  parsePlacement,
  placementFromPosition,
  toPlacement,
  txArrowInset,
  txArrowOffset,
  txArrowPositions,
  txPositions,
} from './placements';

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

describe('txArrowPositions', () => {
  const avatar = { top: 100, left: 500, width: 37, height: 37 };
  const pane = { width: 240, height: 120 };
  const byPlacement = (positions: ReturnType<typeof txPositions>) =>
    Object.fromEntries(positions.map((position) => [placementFromPosition(position), position]));

  it('moves aligned positions outward so that the arrow still points at a small origin', () => {
    const moved = byPlacement(txArrowPositions(txPositions('bottom-end', 10), { inset: 32, origin: avatar, pane }));
    expect(moved['bottom-end']).toMatchObject({ offsetX: 13.5, offsetY: 10 });
    expect(moved['bottom-start']).toMatchObject({ offsetX: -13.5 });
    expect(moved['top-end'].offsetX).toBe(13.5);
    expect(moved['bottom'].offsetX).toBeUndefined();
  });

  it('mirrors the move right to left and moves side placements along the side', () => {
    const rtl = byPlacement(txArrowPositions(txPositions('bottom-end', 10), { inset: 32, origin: avatar, pane, rtl: true }));
    expect(rtl['bottom-end'].offsetX).toBe(-13.5);
    expect(rtl['bottom-start'].offsetX).toBe(13.5);
    const side = byPlacement(txArrowPositions(txPositions('right-start', 10), { inset: 32, origin: avatar, pane, rtl: true }));
    expect(side['right-start']).toMatchObject({ offsetX: 10, offsetY: -13.5 });
    expect(side['right-end'].offsetY).toBe(13.5);
  });

  it('never moves a panel past the edges it must stay inside', () => {
    const bounds = { top: 108, right: 545, bottom: 160, left: 495 };
    const moved = byPlacement(txArrowPositions(txPositions('bottom-end', 10), { inset: 32, origin: avatar, pane, bounds }));
    expect(moved['bottom-end'].offsetX).toBe(8);
    expect(moved['bottom-start'].offsetX).toBe(-5);
    const side = byPlacement(txArrowPositions(txPositions('left-start', 10), { inset: 32, origin: avatar, pane, bounds }));
    expect(side['left-start'].offsetY).toBeUndefined();
    expect(side['left-end'].offsetY).toBe(13.5);
    const squeezed = txArrowPositions(txPositions('bottom-end', 10), { inset: 32, origin: avatar, pane, bounds: { ...bounds, right: 530 } });
    expect(byPlacement(squeezed)['bottom-end'].offsetX).toBeUndefined();
  });

  it('keeps positions when the arrow already points at the origin or the pane is small', () => {
    const positions = txPositions('bottom-start', 10);
    const wide = txArrowPositions(positions, { inset: 32, origin: { top: 100, left: 500, width: 120, height: 40 }, pane });
    expect(wide).toEqual(positions);
    const tiny = byPlacement(txArrowPositions(positions, { inset: 32, origin: avatar, pane: { width: 40, height: 30 } }));
    expect(tiny['bottom-start'].offsetX).toBe(-1.5);
    const foreign = { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' } as const;
    expect(txArrowPositions([foreign], { inset: 32, origin: avatar, pane })).toEqual([foreign]);
  });
});

describe('txArrowInset', () => {
  afterEach(() => document.body.replaceChildren());

  it('adds the corner radius and border of the panel to the arrow width', () => {
    const panel = document.createElement('div');
    panel.style.borderTopLeftRadius = '18px';
    const arrow = document.createElement('span');
    Object.defineProperty(arrow, 'offsetWidth', { value: 14 });
    panel.appendChild(arrow);
    document.body.appendChild(panel);
    expect(txArrowInset(panel, arrow)).toBe(32);
    panel.style.border = '1px solid';
    expect(txArrowInset(panel, arrow)).toBe(33);
    document.body.appendChild(arrow);
    expect(txArrowInset(panel, arrow)).toBe(32);
    panel.appendChild(arrow);
    panel.style.border = '';
    panel.style.borderTopLeftRadius = '';
    expect(txArrowInset(panel, arrow)).toBe(14);
  });

  it('is zero without a panel or a drawn arrow', () => {
    const panel = document.createElement('div');
    const arrow = document.createElement('span');
    expect(txArrowInset(panel, arrow)).toBe(0);
    expect(txArrowInset(null, arrow)).toBe(0);
    expect(txArrowInset(panel, null)).toBe(0);
  });
});
