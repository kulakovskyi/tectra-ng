import { txAnimateEnter, txAnimateLeave, txPopOrigin } from './overlay-motion';

describe('overlay motion', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
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
    expect(frames[0]).toMatchObject({ opacity: 0, transform: 'scale(0.86)', transformOrigin: '40px 100%' });
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

  it('skips motion when the user asks for less', async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    const element = document.createElement('div');
    element.animate = vi.fn();
    txAnimateEnter(element, 'left');
    await txAnimateLeave(element, 'left');
    expect(element.animate).not.toHaveBeenCalled();
  });
});
