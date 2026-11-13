import { parsePlacement } from './placements';
import { TxOverlayMotion, TxPlacement, TxPlacementSide } from './overlay.types';

const ORIGIN: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const SHIFT: Record<string, string> = { top: '0 4px', bottom: '0 -4px', left: '4px 0', right: '-4px 0' };

function canAnimate(element: Element): element is HTMLElement {
  const reduce = element.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return typeof (element as HTMLElement).animate === 'function' && !reduce;
}

function slideFrames(element: HTMLElement, placement: TxPlacement): Keyframe[] {
  const { side, align } = parsePlacement(placement);
  const x = side === 'left' || side === 'right' ? ORIGIN[side] : align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
  const y = side === 'top' || side === 'bottom' ? ORIGIN[side] : align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center';
  const transformOrigin = `${x} ${y}`;
  const [dx, dy] = SHIFT[side].split(' ');
  const base = element.style.transform;
  return [
    { opacity: 0, transform: `${base} translate(${dx}, ${dy}) scale(0.96)`.trim(), transformOrigin },
    { opacity: 1, transform: `${base} translate(0, 0) scale(1)`.trim(), transformOrigin },
  ];
}

function pointAlong(start: number, size: number, target: number | undefined): string {
  if (target === undefined || size === 0) {
    return '50%';
  }
  return `${Math.min(Math.max(target - start, 0), size)}px`;
}

/** CSS `transform-origin` for the pop animation: the edge of the overlay facing its side, at the anchor center. */
export function txPopOrigin(element: Element, side: TxPlacementSide, anchor?: Element): string {
  const box = element.getBoundingClientRect();
  const target = anchor?.getBoundingClientRect();
  if (side === 'top' || side === 'bottom') {
    const x = pointAlong(box.left, box.width, target && target.left + target.width / 2);
    return `${x} ${side === 'top' ? '100%' : '0%'}`;
  }
  const y = pointAlong(box.top, box.height, target && target.top + target.height / 2);
  return `${side === 'left' ? '100%' : '0%'} ${y}`;
}

function popFrames(element: HTMLElement, placement: TxPlacement, anchor: Element | undefined, scale: number): Keyframe[] {
  const transformOrigin = txPopOrigin(element, parsePlacement(placement).side, anchor);
  const base = element.style.transform;
  return [
    { opacity: 0, transform: `${base} scale(${scale})`.trim(), transformOrigin },
    { opacity: 1, transform: `${base} scale(1)`.trim(), transformOrigin },
  ];
}

/** Plays the open animation of an overlay; does nothing under reduced motion. */
export function txAnimateEnter(element: Element, placement: TxPlacement, motion: TxOverlayMotion = 'slide', anchor?: Element): void {
  if (!canAnimate(element)) {
    return;
  }
  if (motion === 'pop') {
    element.animate(popFrames(element, placement, anchor, 0.9), { duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    return;
  }
  element.animate(slideFrames(element, placement), { duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
}

/** Plays the close animation of an overlay and resolves when it ends; resolves at once under reduced motion. */
export function txAnimateLeave(element: Element, placement: TxPlacement, motion: TxOverlayMotion = 'slide', anchor?: Element): Promise<void> {
  if (!canAnimate(element)) {
    return Promise.resolve();
  }
  element.style.pointerEvents = 'none';
  const frames = motion === 'pop' ? popFrames(element, placement, anchor, 0.94) : slideFrames(element, placement);
  const timing: KeyframeAnimationOptions =
    motion === 'pop'
      ? { duration: 120, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
      : { duration: 110, easing: 'cubic-bezier(0.3, 0, 1, 1)', fill: 'forwards' };
  const animation = element.animate([...frames].reverse(), timing);
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}
