import { CdkConnectedOverlay, OverlayRef, ScrollStrategy, createNoopScrollStrategy, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT, DestroyRef, Directive, ElementRef, Injector, inject } from '@angular/core';

type ScrollAxis = 'block' | 'inline';
type ScrollTimelineConstructor = new (options: { source: Element; axis: ScrollAxis }) => AnimationTimeline;

const SCROLLABLE = /^(auto|scroll|overlay)$/;

function scrollTimeline(view: Window | null): ScrollTimelineConstructor | undefined {
  return (view as unknown as { ScrollTimeline?: ScrollTimelineConstructor } | null)?.ScrollTimeline;
}

export function txFollowsScroll(view: Window | null): boolean {
  return typeof scrollTimeline(view) === 'function';
}

export function txScrollStrategy(injector: Injector): ScrollStrategy {
  return txFollowsScroll(injector.get(DOCUMENT).defaultView) ? createNoopScrollStrategy() : createRepositionScrollStrategy(injector);
}

export function scrollersOf(origin: Element): Element[] {
  const document = origin.ownerDocument;
  const view = document.defaultView;
  const scrollers: Element[] = [];
  for (let node = origin.parentElement; node && view; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) {
      break;
    }
    const style = view.getComputedStyle(node);
    if (style.position === 'fixed' || style.position === 'sticky') {
      return scrollers;
    }
    if (SCROLLABLE.test(style.overflowY) || SCROLLABLE.test(style.overflowX)) {
      scrollers.push(node);
    }
  }
  if (document.scrollingElement) {
    scrollers.push(document.scrollingElement);
  }
  return scrollers;
}

interface ScrollTrack {
  source: Element;
  axis: ScrollAxis;
}

function range(track: ScrollTrack): number {
  const { source, axis } = track;
  return axis === 'block' ? source.scrollHeight - source.clientHeight : source.scrollWidth - source.clientWidth;
}

function offset(track: ScrollTrack): number {
  return track.axis === 'block' ? track.source.scrollTop : track.source.scrollLeft;
}

function shift(track: ScrollTrack, by: number): string {
  return `${track.axis === 'block' ? 'translateY' : 'translateX'}(${by}px)`;
}

export function txAnchorPane(overlayRef: OverlayRef, origin: Element): () => void {
  const host = overlayRef.hostElement;
  const pane = overlayRef.overlayElement;
  const Timeline = scrollTimeline(origin.ownerDocument.defaultView);
  if (!Timeline || typeof host.animate !== 'function') {
    return () => undefined;
  }
  const tracks = scrollersOf(origin)
    .flatMap((source) => (['block', 'inline'] as const).map((axis) => ({ source, axis })))
    .filter((track) => range(track) > 0)
    .slice(0, 2);
  if (!tracks.length) {
    return () => undefined;
  }

  const layers = [host, pane].slice(0, tracks.length);
  const animations = layers.map((layer, index) =>
    layer.animate([], { timeline: new Timeline(tracks[index]), fill: 'both' }),
  );

  const follow = () => {
    tracks.forEach((track, index) => {
      const base = index === 0 ? '' : `${pane.style.transform} `;
      const from = offset(track);
      (animations[index].effect as KeyframeEffect).setKeyframes([
        { transform: `${base}${shift(track, from)}` },
        { transform: `${base}${shift(track, from - range(track))}` },
      ]);
    });
  };

  const observer = new MutationObserver(follow);
  observer.observe(pane, { attributes: true, attributeFilter: ['style'] });
  follow();

  let released = false;
  const release = () => {
    if (released) {
      return;
    }
    released = true;
    observer.disconnect();
    subscription.unsubscribe();
    animations.forEach((animation) => animation.cancel());
  };
  const subscription = overlayRef.detachments().subscribe(release);
  return release;
}

@Directive({ selector: '[cdkConnectedOverlay][txOverlayAnchor]' })
export class TxOverlayAnchor {
  private connectedOverlay = inject(CdkConnectedOverlay);
  private release: () => void = () => undefined;

  constructor() {
    const subscription = this.connectedOverlay.attach.subscribe(() => {
      this.release();
      const overlayRef = this.connectedOverlay.overlayRef;
      const origin = this.originElement();
      if (overlayRef && origin) {
        this.release = txAnchorPane(overlayRef, origin);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      this.release();
    });
  }

  private originElement(): Element | null {
    const origin = this.connectedOverlay.origin;
    if (origin instanceof ElementRef) {
      return origin.nativeElement;
    }
    if (origin instanceof Element) {
      return origin;
    }
    if (origin && 'elementRef' in origin) {
      return origin.elementRef.nativeElement;
    }
    return null;
  }
}
