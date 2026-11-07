import { ConnectedPosition } from '@angular/cdk/overlay';
import { TxOverlayBounds, TxOverlaySize, TxPlacement, TxPlacementAlign, TxPlacementSide } from './overlay.types';

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

function sidesAround(side: TxPlacementSide, align: TxPlacementAlign): [TxPlacementSide, TxPlacementAlign][] {
  const otherAligns = ALIGNS.filter((value) => value !== align);
  return [
    [side, align],
    [OPPOSITE[side], align],
    ...otherAligns.map((value): [TxPlacementSide, TxPlacementAlign] => [side, value]),
    ...otherAligns.map((value): [TxPlacementSide, TxPlacementAlign] => [OPPOSITE[side], value]),
  ];
}

export function txPositions(placement: TxPlacement = 'bottom-start', offset = 4): ConnectedPosition[] {
  const { side, align } = parsePlacement(placement);
  const across = side === 'left' || side === 'right' ? sidesAround('bottom', 'center') : [];
  return [...sidesAround(side, align), ...across].map(([s, a]) => position(s, a, offset));
}

export function placementFromPosition(position: ConnectedPosition): TxPlacement | null {
  const panelClass = Array.isArray(position.panelClass) ? position.panelClass[0] : position.panelClass;
  return panelClass?.startsWith('tx-placement-') ? (panelClass.replace('tx-placement-', '') as TxPlacement) : null;
}

export function txArrowOffset(placement: TxPlacement, origin: TxOverlaySize, inset?: string): string {
  const { side, align } = parsePlacement(placement);
  const half = (side === 'top' || side === 'bottom' ? origin.width : origin.height) / 2;
  const lead = inset ? `min(${inset}, ${half}px)` : `${half}px`;
  const point = align === 'start' ? lead : align === 'end' ? `100% - ${lead}` : '50%';
  return `calc(${point} - var(--tx-overlay-shift, 0px))`;
}

type TxEdge ='start' | 'center' | 'end' | 'top' | 'bottom';
type TxBox = Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>;

function anchor(start: number, size: number, edge: TxEdge): number {
  return edge === 'center' ? start + size / 2 : edge === 'start' || edge === 'top' ? start : start + size;
}

function lead(size: number, edge: TxEdge): number {
  return edge === 'center' ? size / 2 : edge === 'start' || edge === 'top' ? 0 : size;
}

export function fitsInBounds(position: ConnectedPosition, origin: TxBox, size: TxOverlaySize, bounds: TxOverlayBounds): boolean {
  const left = anchor(origin.left, origin.width, position.originX) - lead(size.width, position.overlayX) + (position.offsetX ?? 0);
  const top = anchor(origin.top, origin.height, position.originY) - lead(size.height, position.overlayY) + (position.offsetY ?? 0);
  return left >= bounds.left && top >= bounds.top && left + size.width <= bounds.right && top + size.height <= bounds.bottom;
}

export function orderByRoom(positions: ConnectedPosition[], origin: TxBox, size: TxOverlaySize, bounds: TxOverlayBounds): ConnectedPosition[] {
  const index = positions.findIndex((position) => fitsInBounds(position, origin, size, bounds));
  return index > 0 ? [positions[index], ...positions.filter((_, other) => other !== index)] : positions;
}
