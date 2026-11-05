import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { scrollersOf, txAnchorPane } from './overlay-anchor';

class FakeScrollTimeline {
  constructor(readonly options: { source: Element; axis: string }) {}
}

function scrollable(element: HTMLElement, top: number, height: number, client: number): void {
  Object.defineProperty(element, 'scrollTop', { value: top, configurable: true });
  Object.defineProperty(element, 'scrollHeight', { value: height, configurable: true });
  Object.defineProperty(element, 'clientHeight', { value: client, configurable: true });
  Object.defineProperty(element, 'scrollWidth', { value: 100, configurable: true });
  Object.defineProperty(element, 'clientWidth', { value: 100, configurable: true });
}

describe('txAnchorPane', () => {
  let detachments: Subject<void>;
  let host: HTMLElement;
  let pane: HTMLElement;
  let body: HTMLElement;
  let origin: HTMLElement;
  let overlayRef: OverlayRef;
  const keyframes = new Map<HTMLElement, Keyframe[]>();
  const timelines = new Map<HTMLElement, FakeScrollTimeline>();
  const cancel = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('ScrollTimeline', FakeScrollTimeline);
    keyframes.clear();
    timelines.clear();
    detachments = new Subject<void>();
    host = document.createElement('div');
    pane = document.createElement('div');
    host.appendChild(pane);
    for (const layer of [host, pane]) {
      layer.animate = vi.fn((_frames: Keyframe[], options: { timeline: FakeScrollTimeline }) => {
        timelines.set(layer, options.timeline);
        return { cancel, effect: { setKeyframes: (frames: Keyframe[]) => keyframes.set(layer, frames) } } as unknown as Animation;
      }) as unknown as HTMLElement['animate'];
    }
    body = document.createElement('div');
    body.style.overflowY = 'auto';
    origin = document.createElement('button');
    body.appendChild(origin);
    document.body.append(body, host);
    scrollable(body, 120, 900, 300);
    scrollable(document.documentElement, 0, 600, 600);
    overlayRef = { overlayElement: pane, hostElement: host, detachments: () => detachments } as unknown as OverlayRef;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('moves the panel with the scrolling container of its field, off the main thread', async () => {
    txAnchorPane(overlayRef, origin);
    expect(timelines.get(host)?.options).toEqual({ source: body, axis: 'block' });
    expect(keyframes.get(host)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-480px)' }]);

    scrollable(body, 200, 900, 300);
    pane.style.top = '40px';
    await Promise.resolve();
    expect(keyframes.get(host)).toEqual([{ transform: 'translateY(200px)' }, { transform: 'translateY(-400px)' }]);
  });

  it('stops following once the overlay detaches', () => {
    txAnchorPane(overlayRef, origin);
    detachments.next();
    expect(cancel).toHaveBeenCalled();
  });

  it('does not follow scrollers above a fixed layer', () => {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.appendChild(body);
    document.body.appendChild(dialog);
    expect(scrollersOf(origin)).toEqual([body]);
  });

  it('keeps the script positioning where scroll timelines are missing', () => {
    vi.unstubAllGlobals();
    txAnchorPane(overlayRef, origin);
    expect(host.animate).not.toHaveBeenCalled();
  });
});
