import { parsePlacement } from './placements';
import { TxPlacement } from './overlay.types';

const ORIGIN: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const SHIFT: Record<string, string> = { top: '0 4px', bottom: '0 -4px', left: '4px 0', right: '-4px 0' };

function canAnimate(element: Element): element is HTMLElement {
  const reduce = element.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return typeof (element as HTMLElement).animate === 'function' && !reduce;
}

function frames(element: HTMLElement, placement: TxPlacement): Keyframe[] {
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

export function txAnimateEnter(element: Element, placement: TxPlacement): void {
  if (canAnimate(element)) {
    element.animate(frames(element, placement), { duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  }
}

export function txAnimateLeave(element: Element, placement: TxPlacement): Promise<void> {
  if (!canAnimate(element)) {
    return Promise.resolve();
  }
  element.style.pointerEvents = 'none';
  const animation = element.animate([...frames(element, placement)].reverse(), { duration: 110, easing: 'cubic-bezier(0.3, 0, 1, 1)', fill: 'forwards' });
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}
