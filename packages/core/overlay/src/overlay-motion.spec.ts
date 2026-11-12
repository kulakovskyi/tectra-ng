import { txAnimateEnter, txAnimateLeave, txPopOrigin } from './overlay-motion';

describe('overlay motion', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('animates from the side of the origin', () => {
    const element = document.createElement('div');
    const animate = vi.fn(() => ({ finished: Promise.resolve() }) as unknown as Animation);
    element.animate = animate;
    txAnimateEnter(element, 'bottom-start');
    const [frames] = animate.mock.calls[0] as unknown as [Keyframe[]];
    expect(frames[0]).toMatchObject({ opacity: 0, transformOrigin: 'left top' });
    expect(frames[1]).toMatchObject({ opacity: 1 });
  });

  it('keeps the offset transform of the overlay pane', () => {
    const element = document.createElement('div');
    element.style.transform = 'translateY(8px)';
    const animate = vi.fn(() => ({ finished: Promise.resolve() }) as unknown as Animation);
    element.animate = animate;
    txAnimateEnter(element, 'bottom');
    const [frames] = animate.mock.calls[0] as unknown as [Keyframe[]];
    expect(frames[0]['transform']).toBe('translateY(8px) translate(0, -4px) scale(0.96)');
    expect(frames[1]['transform']).toBe('translateY(8px) translate(0, 0) scale(1)');
  });

  it('pops from the point that faces the anchor, without a shift', () => {
    const element = document.createElement('div');
    const anchor = document.createElement('button');
    element.getBoundingClientRect = () => ({ left: 100, top: 20, width: 80, height: 28 }) as DOMRect;
    anchor.getBoundingClientRect = () => ({ left: 122, top: 52, width: 36, height: 36 }) as DOMRect;
    const animate = vi.fn(() => ({ finished: Promise.resolve() }) as unknown as Animation);
    element.animate = animate;
    txAnimateEnter(element, 'top', 'pop', anchor);
    const [frames] = animate.mock.calls[0] as unknown as [Keyframe[]];
    expect(frames[0]).toMatchObject({ opacity: 0, transform: 'scale(0.9)', transformOrigin: '40px 100%' });
    expect(frames[1]).toMatchObject({ opacity: 1, transform: 'scale(1)' });
  });

  it('keeps the pop origin inside the panel and on the side next to the anchor', () => {
    const element = document.createElement('div');
    const anchor = document.createElement('button');
    element.getBoundingClientRect = () => ({ left: 0, top: 100, width: 60, height: 40 }) as DOMRect;
    anchor.getBoundingClientRect = () => ({ left: 70, top: 0, width: 20, height: 20 }) as DOMRect;
    expect(txPopOrigin(element, 'right', anchor)).toBe('0% 0px');
    expect(txPopOrigin(element, 'left')).toBe('100% 50%');
    expect(txPopOrigin(element, 'bottom', anchor)).toBe('60px 0%');
  });

  it('plays the leave animation and resolves after it', async () => {
    const element = document.createElement('div');
    element.animate = vi.fn(() => ({ finished: Promise.resolve() }) as unknown as Animation);
    await txAnimateLeave(element, 'top');
    expect(element.style.pointerEvents).toBe('none');
  });

  it('grows side panels from the origin edge and aligned ones from their corner', () => {
    const element = document.createElement('div');
    const animate = vi.fn(() => ({ finished: Promise.resolve() }) as unknown as Animation);
    element.animate = animate;
    const origins = (['right-start', 'left-end', 'right', 'top-end', 'top'] as const).map((placement) => {
      txAnimateEnter(element, placement);
      const [frames] = animate.mock.calls.at(-1) as unknown as [Keyframe[]];
      return [frames[0]['transformOrigin'], frames[0]['transform']];
    });
    expect(origins).toEqual([
      ['left top', 'translate(-4px, 0) scale(0.96)'],
      ['right bottom', 'translate(4px, 0) scale(0.96)'],
      ['left center', 'translate(-4px, 0) scale(0.96)'],
      ['right bottom', 'translate(0, 4px) scale(0.96)'],
      ['center bottom', 'translate(0, 4px) scale(0.96)'],
    ]);
  });

  it('pops out in reverse and resolves even when the animation is cancelled', async () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect;
    const animate = vi.fn(() => ({ finished: Promise.reject(new Error('cancelled')) }) as unknown as Animation);
    element.animate = animate;
    await expect(txAnimateLeave(element, 'bottom', 'pop')).resolves.toBeUndefined();
    const [frames, timing] = animate.mock.calls[0] as unknown as [Keyframe[], KeyframeAnimationOptions];
    expect(frames[0]).toMatchObject({ opacity: 1, transform: 'scale(1)', transformOrigin: '50% 0%' });
    expect(frames[1]).toMatchObject({ opacity: 0, transform: 'scale(0.94)' });
    expect(timing).toEqual({ duration: 120, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
  });

  it('skips motion when the user asks for less', async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    const element = document.createElement('div');
    element.animate = vi.fn();
    txAnimateEnter(element, 'left');
    await txAnimateLeave(element, 'left');
    expect(element.animate).not.toHaveBeenCalled();
  });
});
