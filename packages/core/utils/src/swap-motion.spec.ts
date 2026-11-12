import { txCanAnimate, txCssTime, txSwapMotion } from './swap-motion';

describe('txSwapMotion', () => {
  it('slides in from the side of the direction and out to the other', () => {
    const forward = txSwapMotion('slide', 1);
    expect(forward?.enter[0]).toEqual({ transform: 'translate3d(100%, 0, 0)' });
    expect(forward?.leave[1]).toEqual({ transform: 'translate3d(-100%, 0, 0)' });
    const up = txSwapMotion('slide', -1, 'y');
    expect(up?.enter[0]).toEqual({ transform: 'translate3d(0, -100%, 0)' });
  });

  it('describes fade, zoom, blur and a sequential flip', () => {
    expect(txSwapMotion('fade', 1)?.enter).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(txSwapMotion('zoom', 1)?.enter[0]).toEqual({ opacity: 0, transform: 'scale(0.92)' });
    expect(txSwapMotion('blur', 1)?.leave[1]).toEqual({ opacity: 0, filter: 'blur(12px)' });
    const flip = txSwapMotion('flip', 1);
    expect(flip?.sequential).toBe(true);
    expect(flip?.enter[0]).toEqual({ opacity: 0, transform: 'perspective(1200px) rotateY(-90deg)' });
    expect(txSwapMotion('none', 1)).toBeNull();
    expect(txSwapMotion('flip', -1, 'y')?.enter[0]).toEqual({ opacity: 0, transform: 'perspective(1200px) rotateX(-90deg)' });
  });

  it('reads times from CSS and skips elements that cannot animate', () => {
    const element = document.createElement('div');
    element.style.setProperty('--speed', '0.3s');
    element.style.setProperty('--fast', '120ms');
    document.body.appendChild(element);
    expect(txCssTime(element, '--speed', 500)).toBe(300);
    expect(txCssTime(element, '--fast', 500)).toBe(120);
    expect(txCssTime(element, '--missing', 500)).toBe(500);
    expect(txCanAnimate(null)).toBe(false);
    element.remove();
  });

  it('animates only elements that can, unless reduced motion is asked for', () => {
    const matchMedia = window.matchMedia;
    const element = document.createElement('div');
    expect(txCanAnimate(element)).toBe(typeof element.animate === 'function');
    element.animate = vi.fn();
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    expect(txCanAnimate(element)).toBe(true);
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    expect(txCanAnimate(element)).toBe(false);
    window.matchMedia = matchMedia;
  });

  it('falls back for an element of a document without a window', () => {
    const element = document.implementation.createHTMLDocument('').createElement('div');
    expect(txCssTime(element, '--speed', 250)).toBe(250);
  });
});
