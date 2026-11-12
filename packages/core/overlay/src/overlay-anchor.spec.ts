import { CdkConnectedOverlay, CdkOverlayOrigin, FlexibleConnectedPositionStrategyOrigin, OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TxOverlayAnchor, scrollTracksOf, scrollersOf, txAnchorPane } from './overlay-anchor';
import { TxOverlayInsets } from './overlay-insets.service';

class FakeScrollTimeline {
  constructor(readonly options: { source: Element; axis: string }) {}
}

class FakeAnimation {
  get rangeEnd(): string {
    return '';
  }
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
  const ranges = new Map<HTMLElement, { rangeStart?: string; rangeEnd?: string }>();
  const cancel = vi.fn();
  let direction = 'ltr';

  beforeEach(() => {
    vi.stubGlobal('ScrollTimeline', FakeScrollTimeline);
    vi.stubGlobal('Animation', FakeAnimation);
    keyframes.clear();
    ranges.clear();
    timelines.clear();
    direction = 'ltr';
    detachments = new Subject<void>();
    host = document.createElement('div');
    pane = document.createElement('div');
    host.appendChild(pane);
    for (const layer of [host, pane]) {
      layer.animate = vi.fn((_frames: Keyframe[], options: { timeline: FakeScrollTimeline; rangeStart: string; rangeEnd: string }) => {
        timelines.set(layer, options.timeline);
        const range = { rangeStart: options.rangeStart, rangeEnd: options.rangeEnd };
        ranges.set(layer, range);
        return {
          cancel,
          set rangeEnd(value: string) {
            range.rangeEnd = value;
          },
          effect: { setKeyframes: (frames: Keyframe[]) => keyframes.set(layer, frames) },
        } as unknown as Animation;
      }) as unknown as HTMLElement['animate'];
    }
    body = document.createElement('div');
    body.style.overflowY = 'auto';
    origin = document.createElement('button');
    body.appendChild(origin);
    document.body.append(body, host);
    scrollable(body, 120, 900, 300);
    scrollable(document.documentElement, 0, 600, 600);
    overlayRef = { overlayElement: pane, hostElement: host, detachments: () => detachments, getDirection: () => direction } as unknown as OverlayRef;
  });

  afterEach(() => {
    Object.defineProperty(document, 'scrollingElement', { value: null, configurable: true });
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('moves the panel with the scrolling container of its field, off the main thread', async () => {
    txAnchorPane(overlayRef, origin);
    expect(timelines.get(pane)?.options).toEqual({ source: body, axis: 'block' });
    expect(ranges.get(pane)).toEqual({ rangeStart: '0px', rangeEnd: '900px' });
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-780px)' }]);

    scrollable(body, 200, 900, 300);
    pane.style.top = '40px';
    await Promise.resolve();
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(200px)' }, { transform: 'translateY(-700px)' }]);
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
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-780px)' }]);
  });

  it('rebuilds the scroll keyframes and range when the content grows', () => {
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
    expect(keyframes.get(pane)?.[1]).toEqual({ transform: 'translateY(-780px)' });
    scrollable(body, 200, 2900, 300);
    callbacks.forEach((callback) => callback([], {} as ResizeObserver));
    expect(ranges.get(pane)?.rangeEnd).toBe('2900px');
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateY(120px)' }, { transform: 'translateY(-2780px)' }]);
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

  it('lets a panel opened from another panel follow the same scroll', () => {
    txAnchorPane(overlayRef, origin);
    const layer = document.createElement('div');
    layer.style.position = 'fixed';
    layer.appendChild(host);
    document.body.appendChild(layer);
    const nested = document.createElement('button');
    pane.appendChild(nested);
    expect(scrollersOf(nested)).toEqual([body]);
    detachments.next();
    expect(scrollersOf(nested)).toEqual([]);
  });

  it('keeps the script positioning where scroll timelines are missing', () => {
    vi.unstubAllGlobals();
    txAnchorPane(overlayRef, origin);
    expect(pane.animate).not.toHaveBeenCalled();
  });

  it('keeps the script positioning where scroll timelines take no pixel range', () => {
    vi.stubGlobal('Animation', class {});
    txAnchorPane(overlayRef, origin);
    expect(pane.animate).not.toHaveBeenCalled();
  });

  const sized = (element: HTMLElement, width: number, height: number) => {
    Object.defineProperty(element, 'clientWidth', { value: width, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: height, configurable: true });
  };

  it('lines a bottom-anchored pane up with the page when the overlay layer is taller than the page viewport', async () => {
    vi.unstubAllGlobals();
    sized(document.documentElement, 402, 714);
    sized(host, 402, 754);
    txAnchorPane(overlayRef, origin);
    expect(pane.style.translate).toBe('');
    pane.style.bottom = '300px';
    await Promise.resolve();
    expect(pane.style.translate).toBe('0px -40px');
    pane.style.bottom = '';
    pane.style.top = '120px';
    await Promise.resolve();
    expect(pane.style.translate).toBe('');
  });

  it('lines a right-anchored pane up with the page width', async () => {
    vi.unstubAllGlobals();
    sized(document.documentElement, 390, 700);
    sized(host, 400, 700);
    pane.style.right = '20px';
    txAnchorPane(overlayRef, origin);
    expect(pane.style.translate).toBe('-10px 0px');
  });

  it('follows the layout viewport, not the zoomed visual viewport, while the page scrolls', () => {
    withPage();
    const visual = { pageLeft: 0, pageTop: 0, offsetLeft: 0, offsetTop: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('visualViewport', visual);
    scrollable(document.documentElement, 0, 3000, 700);
    document.body.appendChild(origin);
    const release = txAnchorPane(overlayRef, origin);
    expect(timelines.get(pane)?.options.source).toBe(document.documentElement);

    scrollable(document.documentElement, 640, 3000, 700);
    Object.assign(visual, { pageTop: 640, offsetTop: 210 });
    const nudge = visual.addEventListener.mock.calls.find(([type]) => type === 'scroll')?.[1] as () => void;
    nudge();
    expect(pane.style.translate).toBe('0px 210px');

    release();
    expect(visual.removeEventListener).toHaveBeenCalledWith('scroll', nudge);
  });

  const wide = (width: number, height = 40) => {
    Object.defineProperty(pane, 'offsetWidth', { value: width, configurable: true });
    Object.defineProperty(pane, 'offsetHeight', { value: height, configurable: true });
  };

  it('slides a panel wider than the room beside its element back onto a narrow screen and keeps the arrow on the element', () => {
    vi.unstubAllGlobals();
    sized(document.documentElement, 402, 714);
    sized(host, 402, 714);
    wide(320);
    pane.classList.add('tx-placement-bottom');
    pane.style.left = '-31px';
    txAnchorPane(overlayRef, origin);
    expect(pane.style.translate).toBe('39px 0px');
    expect(pane.style.getPropertyValue('--tx-overlay-shift')).toBe('39px');
  });

  it('mirrors the arrow shift for right-to-left text', () => {
    vi.unstubAllGlobals();
    direction = 'rtl';
    sized(document.documentElement, 402, 714);
    sized(host, 402, 714);
    wide(320);
    pane.classList.add('tx-placement-bottom-start');
    pane.style.right = '-20px';
    txAnchorPane(overlayRef, origin);
    expect(pane.style.translate).toBe('-28px 0px');
    expect(pane.style.getPropertyValue('--tx-overlay-shift')).toBe('28px');
  });

  it('moves a side panel along its element, never across it', () => {
    vi.unstubAllGlobals();
    sized(document.documentElement, 402, 714);
    sized(host, 402, 714);
    wide(200, 120);
    pane.classList.add('tx-placement-right');
    pane.style.left = '360px';
    pane.style.top = '640px';
    txAnchorPane(overlayRef, origin, undefined, 12);
    expect(pane.style.translate).toBe('0px -58px');
  });

  it('leaves a panel that has room where the CDK put it', () => {
    vi.unstubAllGlobals();
    sized(document.documentElement, 402, 714);
    sized(host, 402, 714);
    wide(200);
    pane.classList.add('tx-placement-bottom-start');
    pane.style.left = '40px';
    txAnchorPane(overlayRef, origin);
    expect(pane.style.translate).toBe('');
    expect(pane.style.getPropertyValue('--tx-overlay-shift')).toBe('');
  });

  const openInTopLayer = () => {
    host.matches = ((selector: string): boolean => selector === ':popover-open') as unknown as HTMLElement['matches'];
  };

  it('lets the browser scroll a top-layer panel with the page instead of animating it', () => {
    withPage();
    vi.stubGlobal('visualViewport', { pageLeft: 0, pageTop: 300, offsetLeft: 0, offsetTop: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    scrollable(document.documentElement, 300, 3000, 700);
    document.body.appendChild(origin);
    openInTopLayer();
    const release = txAnchorPane(overlayRef, origin);
    expect(host.style.position).toBe('absolute');
    expect(host.style.translate).toBe('0px 300px');
    expect(pane.animate).not.toHaveBeenCalled();
    release();
    expect(host.style.position).toBe('');
    expect(host.style.translate).toBe('');
  });

  it('keeps a panel opened from sticky chrome on the screen layer', () => {
    withPage();
    openInTopLayer();
    const header = document.createElement('div');
    header.style.position = 'sticky';
    header.style.top = '0px';
    header.appendChild(origin);
    document.body.appendChild(header);
    txAnchorPane(overlayRef, origin);
    expect(host.style.position).toBe('');
  });

  it('scrolls a top-layer panel inside a scroller with that scroller and the page with the page', () => {
    withPage();
    scrollable(document.documentElement, 0, 3000, 700);
    openInTopLayer();
    txAnchorPane(overlayRef, origin);
    expect(host.style.position).toBe('absolute');
    expect(timelines.get(pane)?.options.source).toBe(body);
    expect(host.animate).not.toHaveBeenCalled();
  });

  it('keeps the page where it was when focus moves into a panel that rides with it', () => {
    withPage();
    scrollable(document.documentElement, 300, 3000, 700);
    document.body.appendChild(origin);
    openInTopLayer();
    const scrollTo = vi.fn();
    document.documentElement.scrollTo = scrollTo as unknown as HTMLElement['scrollTo'];
    const release = txAnchorPane(overlayRef, origin);
    const field = document.createElement('input');
    pane.appendChild(field);

    field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(scrollTo).not.toHaveBeenCalled();

    scrollable(document.documentElement, 690, 3000, 700);
    field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 300, behavior: 'instant' });

    scrollTo.mockClear();
    document.dispatchEvent(new Event('scroll'));
    field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(scrollTo).not.toHaveBeenCalled();
    release();
  });

  const keyboard = (panel: { bottom: number; height: number }, fieldBottom: number) => {
    withPage();
    scrollable(document.documentElement, 300, 3000, 700);
    document.body.appendChild(origin);
    openInTopLayer();
    const listeners: Record<string, () => void> = {};
    const screen = { scale: 1, height: 400, offsetTop: 0, pageTop: 300, offsetLeft: 0, pageLeft: 0, addEventListener: (type: string, listener: () => void) => (listeners[type] = listener), removeEventListener: vi.fn() };
    vi.stubGlobal('visualViewport', screen);
    const scrollBy = vi.fn();
    document.documentElement.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];
    pane.getBoundingClientRect = () => ({ ...panel, top: panel.bottom - panel.height }) as DOMRect;
    const field = document.createElement('input');
    field.getBoundingClientRect = () => ({ bottom: fieldBottom }) as DOMRect;
    pane.appendChild(field);
    txAnchorPane(overlayRef, origin);
    field.focus();
    return { open: () => listeners['resize'](), scrollBy };
  };

  it('scrolls a panel that the on-screen keyboard covers back into view', () => {
    const { open, scrollBy } = keyboard({ bottom: 520, height: 300 }, 380);
    open();
    expect(scrollBy).toHaveBeenCalledWith({ top: 128, behavior: 'instant' });
  });

  it('shows at least the focused field when the whole panel does not fit above the keyboard', () => {
    const { open, scrollBy } = keyboard({ bottom: 900, height: 600 }, 450);
    open();
    expect(scrollBy).toHaveBeenCalledWith({ top: 58, behavior: 'instant' });
  });

  it('leaves the page alone when the focused field is above the keyboard', () => {
    const { open, scrollBy } = keyboard({ bottom: 380, height: 200 }, 300);
    open();
    expect(scrollBy).not.toHaveBeenCalled();
  });
  it('treats a browser without popover support as one without a top layer', () => {
    withPage();
    scrollable(document.documentElement, 0, 3000, 700);
    host.matches = (() => {
      throw new SyntaxError('unsupported');
    }) as unknown as HTMLElement['matches'];
    txAnchorPane(overlayRef, origin);
    expect(host.style.position).toBe('');
  });

  it('moves the panel sideways with a container that scrolls only horizontally', () => {
    scrollable(body, 0, 300, 300);
    Object.defineProperty(body, 'scrollLeft', { value: 50, configurable: true });
    Object.defineProperty(body, 'scrollWidth', { value: 800, configurable: true });
    Object.defineProperty(body, 'clientWidth', { value: 200, configurable: true });
    txAnchorPane(overlayRef, origin);
    expect(timelines.get(pane)?.options).toEqual({ source: body, axis: 'inline' });
    expect(ranges.get(pane)?.rangeEnd).toBe('800px');
    expect(keyframes.get(pane)).toEqual([{ transform: 'translateX(50px)' }, { transform: 'translateX(-750px)' }]);
  });

  it('moves the overlay host with the page when the container already moves the pane', () => {
    withPage();
    scrollable(document.documentElement, 0, 3000, 700);
    txAnchorPane(overlayRef, origin);
    expect(timelines.get(pane)?.options).toEqual({ source: body, axis: 'block' });
    expect(timelines.get(host)?.options).toEqual({ source: document.documentElement, axis: 'block' });
    expect(keyframes.get(host)).toEqual([{ transform: 'translateY(0px)' }, { transform: 'translateY(-3000px)' }]);
  });

  it('follows the layout viewport sideways while the page scrolls horizontally', () => {
    withPage();
    const visual = { pageLeft: 0, pageTop: 0, offsetLeft: 0, offsetTop: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('visualViewport', visual);
    scrollable(document.documentElement, 0, 700, 700);
    Object.defineProperty(document.documentElement, 'scrollWidth', { value: 1200, configurable: true });
    Object.defineProperty(document.documentElement, 'clientWidth', { value: 400, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollLeft', { value: 0, configurable: true });
    document.body.appendChild(origin);
    txAnchorPane(overlayRef, origin);
    expect(timelines.get(pane)?.options).toEqual({ source: document.documentElement, axis: 'inline' });

    Object.defineProperty(document.documentElement, 'scrollLeft', { value: 100, configurable: true });
    Object.assign(visual, { pageLeft: 100, offsetLeft: 30 });
    const nudge = visual.addEventListener.mock.calls.find(([type]) => type === 'scroll')?.[1] as () => void;
    nudge();
    expect(pane.style.translate).toBe('30px 0px');
  });

  it('drops the arrow shift once the panel has room again', async () => {
    vi.unstubAllGlobals();
    sized(document.documentElement, 402, 714);
    sized(host, 402, 714);
    wide(320);
    pane.classList.add('tx-placement-bottom');
    pane.style.left = '-31px';
    txAnchorPane(overlayRef, origin);
    expect(pane.style.getPropertyValue('--tx-overlay-shift')).toBe('39px');
    pane.style.left = '40px';
    await Promise.resolve();
    expect(pane.style.getPropertyValue('--tx-overlay-shift')).toBe('');
    expect(pane.style.translate).toBe('');
  });

  it('leaves the page alone while the page is zoomed or focus is outside the panel', () => {
    const { open, scrollBy } = keyboard({ bottom: 520, height: 300 }, 380);
    const screen = window.visualViewport as unknown as { scale: number };
    screen.scale = 2;
    open();
    screen.scale = 1;
    (document.activeElement as HTMLElement).blur();
    open();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('clips only the bottom chrome when nothing is pinned at the top', () => {
    host.getBoundingClientRect = () => ({ top: 0, bottom: innerHeight - 10 }) as DOMRect;
    const chrome = { measure: () => ({ top: 0, bottom: 40 }) } as unknown as TxOverlayInsets;
    txAnchorPane(overlayRef, origin, chrome);
    expect(host.style.clipPath).toBe('inset(0px 0 30px 0)');
  });

  it('does not clip without pinned chrome', () => {
    const chrome = { measure: () => ({ top: 0, bottom: 0 }) } as unknown as TxOverlayInsets;
    txAnchorPane(overlayRef, origin, chrome);
    expect(host.style.clipPath).toBe('');
  });

  it('clips a top-layer panel that rides with the page under pinned chrome', () => {
    withPage();
    scrollable(document.documentElement, 0, 3000, 700);
    document.body.appendChild(origin);
    openInTopLayer();
    host.getBoundingClientRect = () => ({ top: 10, bottom: 300 }) as DOMRect;
    const chrome = { measure: () => ({ top: 56, bottom: 0 }) } as unknown as TxOverlayInsets;
    const release = txAnchorPane(overlayRef, origin, chrome);
    expect(host.style.position).toBe('absolute');
    expect(host.style.clipPath).toBe('inset(46px 0 0px 0)');
    release();
    expect(host.style.clipPath).toBe('');
  });

  it('releases only once', () => {
    const release = txAnchorPane(overlayRef, origin);
    detachments.next();
    const calls = cancel.mock.calls.length;
    release();
    expect(cancel.mock.calls.length).toBe(calls);
  });
});

type OriginKind = 'directive' | 'ref' | 'element' | 'point';

@Component({
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, TxOverlayAnchor],
  template: `
    <div class="scroller" style="overflow-y: auto">
      <button cdkOverlayOrigin #trigger="cdkOverlayOrigin">Open</button>
    </div>
    <ng-template cdkConnectedOverlay txOverlayAnchor [cdkConnectedOverlayOrigin]="pick(trigger)" [cdkConnectedOverlayOpen]="open()">
      <button class="inside">Inside</button>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AnchorHost {
  readonly open = signal(false);
  readonly kind = signal<OriginKind>('directive');

  pick(trigger: CdkOverlayOrigin): CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin {
    switch (this.kind()) {
      case 'ref':
        return trigger.elementRef;
      case 'element':
        return trigger.elementRef.nativeElement;
      case 'point':
        return { x: 0, y: 0 };
      default:
        return trigger;
    }
  }
}

describe('TxOverlayAnchor', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  async function openWith(kind: OriginKind) {
    const fixture = TestBed.createComponent(AnchorHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.kind.set(kind);
    fixture.componentInstance.open.set(true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const scroller = fixture.nativeElement.querySelector('.scroller') as HTMLElement;
    const inside = document.querySelector('.inside') as HTMLElement;
    return { fixture, scroller, inside };
  }

  it('lets the panel follow the scrollers of an origin given as a directive, a reference or an element', async () => {
    for (const kind of ['directive', 'ref', 'element'] as const) {
      const { fixture, scroller, inside } = await openWith(kind);
      expect(scrollersOf(inside)).toContain(scroller);
      fixture.componentInstance.open.set(false);
      await fixture.whenStable();
      expect(scrollersOf(inside)).not.toContain(scroller);
      fixture.destroy();
      fixture.nativeElement.remove();
    }
  });

  it('re-anchors on every open and lets go of a point origin', async () => {
    const { fixture, scroller, inside } = await openWith('point');
    expect(scrollersOf(inside)).not.toContain(scroller);
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    fixture.componentInstance.kind.set('directive');
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(scrollersOf(document.querySelector('.inside') as HTMLElement)).toContain(scroller);
    fixture.destroy();
    fixture.nativeElement.remove();
  });
});
