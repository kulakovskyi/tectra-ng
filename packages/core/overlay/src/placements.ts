import { ConnectedPosition } from '@angular/cdk/overlay';
import { TxPlacement, TxPlacementAlign, TxPlacementSide } from './overlay.types';

const OPPOSITE: Record<TxPlacementSide, TxPlacementSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const ALIGNS: TxPlacementAlign[] = ['start', 'center', 'end'];

export function parsePlacement(placement: TxPlacement): { side: TxPlacementSide; align: TxPlacementAlign } {
  const [side, align] = placement.split('-') as [TxPlacementSide, TxPlacementAlign | undefined];
  return { side, align: align ?? 'center' };
}

export function toPlacement(side: TxPlacementSide, align: TxPlacementAlign): TxPlacement {
  return (align === 'center' ? side : `${side}-${align}`) as TxPlacement;
}

function position(side: TxPlacementSide, align: TxPlacementAlign, offset: number): ConnectedPosition {
  const placement = toPlacement(side, align);
  const panelClass = `tx-placement-${placement}`;
  if (side === 'top' || side === 'bottom') {
    const x = align === 'start' ? 'start' : align === 'end' ? 'end' : 'center';
    return side === 'bottom'
      ? { originX: x, originY: 'bottom', overlayX: x, overlayY: 'top', offsetY: offset, panelClass }
      : { originX: x, originY: 'top', overlayX: x, overlayY: 'bottom', offsetY: -offset, panelClass };
  }
  const y = align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center';
  return side === 'right'
    ? { originX: 'end', originY: y, overlayX: 'start', overlayY: y, offsetX: offset, panelClass }
    : { originX: 'start', originY: y, overlayX: 'end', overlayY: y, offsetX: -offset, panelClass };
}

export function txPositions(placement: TxPlacement = 'bottom-start', offset = 4): ConnectedPosition[] {
  const { side, align } = parsePlacement(placement);
  const otherAligns = ALIGNS.filter((value) => value !== align);
  const order: [TxPlacementSide, TxPlacementAlign][] = [
    [side, align],
    [OPPOSITE[side], align],
    ...otherAligns.map((value): [TxPlacementSide, TxPlacementAlign] => [side, value]),
    ...otherAligns.map((value): [TxPlacementSide, TxPlacementAlign] => [OPPOSITE[side], value]),
  ];
  return order.map(([s, a]) => position(s, a, offset));
}

export function placementFromPosition(position: ConnectedPosition): TxPlacement | null {
  const panelClass = Array.isArray(position.panelClass) ? position.panelClass[0] : position.panelClass;
  return panelClass?.startsWith('tx-placement-') ? (panelClass.replace('tx-placement-', '') as TxPlacement) : null;
}
