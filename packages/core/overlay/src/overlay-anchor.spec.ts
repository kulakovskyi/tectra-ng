import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { txAnchorPane } from './overlay-anchor';

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

describe('txAnchorPane', () => {
  const supports = vi.fn(() => true);
  let detachments: Subject<void>;
  let pane: HTMLElement;
  let origin: HTMLElement;
  let overlayRef: OverlayRef;

  beforeEach(() => {
    vi.stubGlobal('CSS', { supports });
    detachments = new Subject<void>();
    const host = document.createElement('div');
    host.getBoundingClientRect = () => rect(0, 0, 1000, 800);
    pane = document.createElement('div');
    host.appendChild(pane);
    origin = document.createElement('button');
    origin.getBoundingClientRect = () => rect(100, 40, 120, 36);
    document.body.append(origin, host);
    overlayRef = { overlayElement: pane, hostElement: host, detachments: () => detachments } as unknown as OverlayRef;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('pins the pane to its origin so the browser moves it while scrolling', async () => {
    const written = new Map<string, string>();
    const setProperty = pane.style.setProperty.bind(pane.style);
    vi.spyOn(pane.style, 'setProperty').mockImplementation((property, value, priority) => {
      written.set(property, String(value));
      setProperty(property, value, priority);
    });
    pane.style.top = '140px';
    pane.style.left = '40px';
    txAnchorPane(overlayRef, origin);
    const name = written.get('position-anchor');
    expect(name).toMatch(/^--tx-anchor-\d+$/);
    expect(origin.style.getPropertyValue('anchor-name')).toBe(name);
    expect(written.get('top')).toBe('calc(anchor(top, 100px) + 40px)');
    expect(written.get('left')).toBe('calc(anchor(left, 40px) + 0px)');

    pane.style.bottom = '600px';
    await Promise.resolve();
    expect(written.get('bottom')).toBe('calc(anchor(bottom, 664px) + -64px)');
  });

  it('lets go of the origin when the overlay detaches', () => {
    origin.style.setProperty('anchor-name', '--other');
    txAnchorPane(overlayRef, origin);
    expect(origin.style.getPropertyValue('anchor-name')).toMatch(/^--other, --tx-anchor-\d+$/);
    detachments.next();
    expect(origin.style.getPropertyValue('anchor-name')).toBe('--other');
    expect(pane.style.getPropertyValue('position-anchor')).toBe('');
  });

  it('keeps plain positions where the browser has no anchors', () => {
    supports.mockReturnValueOnce(false);
    pane.style.top = '140px';
    txAnchorPane(overlayRef, origin);
    expect(pane.style.top).toBe('140px');
    expect(origin.style.getPropertyValue('anchor-name')).toBe('');
  });
});
