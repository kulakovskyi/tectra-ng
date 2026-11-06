import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { scrollTracksOf, scrollersOf, txAnchorPane } from './overlay-anchor';
import { TxOverlayInsets } from './overlay-insets.service';

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
    Object.defineProperty(document, 'scrollingElement', { value: null, configurable: true });
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('moves the panel with the scrolling container of its field, off the main thread', async () => {
    txAnchorPane(overlayRef, origin);
    expect(timelines.get(pane)?.options).toEqual({ source: body, axis: 'block' });
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-480px)' }]);

    scrollable(body, 200, 900, 300);
    pane.style.top = '40px';
    await Promise.resolve();
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(200px)' }, { transform: 'translateY(-400px)' }]);
  });

  it('keeps the CDK offset of the pane and slides the panel under pinned chrome', async () => {
    const chrome = { measure: () => ({ top: 56, bottom: 0 }) } as unknown as TxOverlayInsets;
    pane.style.transform = 'translateY(4px)';
    const release = txAnchorPane(overlayRef, origin, chrome);
    expect(keyframes.get(pane)?.[0]).toEqual({ transform: 'translateY(4px) translateY(120px)' });
    expect(host.style.clipPath).toContain('56px');
    release();
    expect(host.style.clipPath).toBe('');
  });

  it('keeps its scroll base when only non-position styles change, so a closing panel does not jump', async () => {
    txAnchorPane(overlayRef, origin);
    scrollable(body, 260, 900, 300);
    pane.style.pointerEvents = 'none';
    await Promise.resolve();
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-480px)' }]);
  });

  it('rebuilds the scroll keyframes when the scroll range changes', () => {
    const callbacks: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          callbacks.push(callback);
        }
        observe(): void {
          return;
        }
        disconnect(): void {
          return;
        }
      },
    );
    txAnchorPane(overlayRef, origin);
    expect(keyframes.get(pane)?.[1]).toEqual({ transform: 'translateY(-480px)' });
    scrollable(body, 200, 2900, 300);
    callbacks.forEach((callback) => callback([], {} as ResizeObserver));
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-2480px)' }]);
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

  const withPage = () => Object.defineProperty(document, 'scrollingElement', { value: document.documentElement, configurable: true });

  it('stops following the page above sticky chrome', () => {
    withPage();
    const header = document.createElement('div');
    header.style.position = 'sticky';
    header.style.top = '0px';
    header.appendChild(origin);
    document.body.appendChild(header);
    expect(scrollTracksOf(origin).map((track) => `${track.source === document.documentElement ? 'page' : 'other'}:${track.axis}`)).toEqual(['page:inline']);
  });

  it('follows the page from a cell that sticks only inside its own scroller', () => {
    withPage();
    const scroller = document.createElement('div');
    scroller.style.overflowX = 'auto';
    const cell = document.createElement('div');
    cell.style.position = 'sticky';
    cell.style.right = '0px';
    cell.appendChild(origin);
    scroller.appendChild(cell);
    document.body.appendChild(scroller);
    const tracks = scrollTracksOf(origin).map((track) => `${track.source === scroller ? 'table' : track.source === document.documentElement ? 'page' : 'other'}:${track.axis}`);
    expect(tracks).toEqual(['table:block', 'page:block', 'page:inline']);
  });

  it('keeps the script positioning where scroll timelines are missing', () => {
    vi.unstubAllGlobals();
    txAnchorPane(overlayRef, origin);
    expect(pane.animate).not.toHaveBeenCalled();
  });
});
