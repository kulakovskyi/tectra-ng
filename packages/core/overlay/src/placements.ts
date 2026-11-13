import { ConnectedPosition } from '@angular/cdk/overlay';
import { TxOverlayBounds, TxOverlaySize, TxPlacement, TxPlacementAlign, TxPlacementSide } from './overlay.types';

const OPPOSITE: Record<TxPlacementSide, TxPlacementSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const ALIGNS: TxPlacementAlign[] = ['start', 'center', 'end'];

/** Splits a placement into its side and alignment; no alignment means `center`. */
export function parsePlacement(placement: TxPlacement): { side: TxPlacementSide; align: TxPlacementAlign } {
  const [side, align] = placement.split('-') as [TxPlacementSide, TxPlacementAlign | undefined];
  return { side, align: align ?? 'center' };
}

/** Joins a side and an alignment into a placement. */
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

/**
 * Connected positions for a placement (default `bottom-start`) and an offset in px (default 4), ordered by
 * preference with the fallbacks after it.
 */
export function txPositions(placement: TxPlacement = 'bottom-start', offset = 4): ConnectedPosition[] {
  const { side, align } = parsePlacement(placement);
  const across = side === 'left' || side === 'right' ? sidesAround('bottom', 'center') : [];
  return [...sidesAround(side, align), ...across].map(([s, a]) => position(s, a, offset));
}

/** Placement a connected position stands for; `null` for a position not made by `txPositions`. */
export function placementFromPosition(position: ConnectedPosition): TxPlacement | null {
  const panelClass = Array.isArray(position.panelClass) ? position.panelClass[0] : position.panelClass;
  return panelClass?.startsWith('tx-placement-') ? (panelClass.replace('tx-placement-', '') as TxPlacement) : null;
}

/**
 * CSS `calc()` value that places an arrow on the origin center, for a placement, origin size and optional
 * inset from the overlay edge.
 */
export function txArrowOffset(placement: TxPlacement, origin: TxOverlaySize, inset?: string): string {
  const { side, align } = parsePlacement(placement);
  const half = (side === 'top' || side === 'bottom' ? origin.width : origin.height) / 2;
  const lead = inset ? `min(${inset}, ${half}px)` : `${half}px`;
  const point = align === 'start' ? lead : align === 'end' ? `100% - ${lead}` : '50%';
  return `calc(${point} - var(--tx-overlay-shift, 0px))`;
}

type TxEdge ='start' | 'center' | 'end' | 'top' | 'bottom';
/** Position and size of an element, as in `DOMRect`. */
type TxBox = Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>;

function anchor(start: number, size: number, edge: TxEdge): number {
  return edge === 'center' ? start + size / 2 : edge === 'start' || edge === 'top' ? start : start + size;
}

function lead(size: number, edge: TxEdge): number {
  return edge === 'center' ? size / 2 : edge === 'start' || edge === 'top' ? 0 : size;
}

/** Tells whether an overlay of the given size placed at a connected position stays inside the bounds. */
export function fitsInBounds(position: ConnectedPosition, origin: TxBox, size: TxOverlaySize, bounds: TxOverlayBounds): boolean {
  const left = anchor(origin.left, origin.width, position.originX) - lead(size.width, position.overlayX) + (position.offsetX ?? 0);
  const top = anchor(origin.top, origin.height, position.originY) - lead(size.height, position.overlayY) + (position.offsetY ?? 0);
  return left >= bounds.left && top >= bounds.top && left + size.width <= bounds.right && top + size.height <= bounds.bottom;
}

/**
 * Moves the first position that fits the bounds to the front; the order stays when the first one already fits
 * or none does.
 */
export function orderByRoom(positions: ConnectedPosition[], origin: TxBox, size: TxOverlaySize, bounds: TxOverlayBounds): ConnectedPosition[] {
  const index = positions.findIndex((position) => fitsInBounds(position, origin, size, bounds));
  return index > 0 ? [positions[index], ...positions.filter((_, other) => other !== index)] : positions;
}
