export type TxSwapEffect = 'slide' | 'fade' | 'zoom' | 'blur' | 'flip' | 'none';

export type TxSwapAxis = 'x' | 'y';

export interface TxSwapMotion {
  enter: Keyframe[];
  leave: Keyframe[];
  sequential: boolean;
}

const NONE = 'translate3d(0, 0, 0)';

export function txSwapMotion(effect: TxSwapEffect, direction: 1 | -1, axis: TxSwapAxis = 'x'): TxSwapMotion | null {
  const shift = (amount: number) => (axis === 'x' ? `translate3d(${amount}%, 0, 0)` : `translate3d(0, ${amount}%, 0)`);
  const turn = (degrees: number) => `perspective(1200px) ${axis === 'x' ? 'rotateY' : 'rotateX'}(${axis === 'x' ? degrees : -degrees}deg)`;
  switch (effect) {
    case 'slide':
      return {
        enter: [{ transform: shift(direction * 100) }, { transform: NONE }],
        leave: [{ transform: NONE }, { transform: shift(direction * -100) }],
        sequential: false,
      };
    case 'fade':
      return { enter: [{ opacity: 0 }, { opacity: 1 }], leave: [{ opacity: 1 }, { opacity: 0 }], sequential: false };
    case 'zoom':
      return {
        enter: [
          { opacity: 0, transform: 'scale(0.92)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        leave: [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(1.06)' },
        ],
        sequential: false,
      };
    case 'blur':
      return {
        enter: [
          { opacity: 0, filter: 'blur(12px)', transform: 'scale(1.02)' },
          { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' },
        ],
        leave: [
          { opacity: 1, filter: 'blur(0)' },
          { opacity: 0, filter: 'blur(12px)' },
        ],
        sequential: false,
      };
    case 'flip':
      return {
        enter: [
          { opacity: 0, transform: turn(direction * -90) },
          { opacity: 1, transform: turn(0) },
        ],
        leave: [
          { opacity: 1, transform: turn(0) },
          { opacity: 0, transform: turn(direction * 90) },
        ],
        sequential: true,
      };
    default:
      return null;
  }
}

export function txCanAnimate(element: Element | null | undefined): element is HTMLElement {
  if (!element || typeof (element as HTMLElement).animate !== 'function') {
    return false;
  }
  return !element.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function txCssTime(element: Element, property: string, fallback: number): number {
  const value = element.ownerDocument.defaultView?.getComputedStyle(element).getPropertyValue(property).trim() ?? '';
  const amount = parseFloat(value);
  if (Number.isNaN(amount)) {
    return fallback;
  }
  return value.endsWith('ms') ? amount : amount * 1000;
}
