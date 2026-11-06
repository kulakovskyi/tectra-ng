import { CdkConnectedOverlay, OverlayRef } from '@angular/cdk/overlay';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { TxOverlayInsets } from './overlay-insets.service';
import { ScrollAxis, scrollTimeline } from './overlay-scroll';

const SCROLLABLE = /^(auto|scroll|overlay)$/;

const AXES: readonly ScrollAxis[] = ['block', 'inline'];

function isSet(value: string): boolean {
  return value !== '' && value !== 'auto';
}

function stickyAxes(style: CSSStyleDeclaration): ScrollAxis[] {
  const axes: ScrollAxis[] = [];
  if (isSet(style.top) || isSet(style.bottom)) axes.push('block');
  if (isSet(style.left) || isSet(style.right)) axes.push('inline');
  return axes;
}

export function scrollTracksOf(origin: Element): ScrollTrack[] {
  const document = origin.ownerDocument;
  const view = document.defaultView;
  const tracks: ScrollTrack[] = [];
  const stuck = new Set<ScrollAxis>();
  for (let node = origin.parentElement; node && view; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) {
      break;
    }
    const style = view.getComputedStyle(node);
    if (style.position === 'fixed') {
      return tracks;
    }
    if (SCROLLABLE.test(style.overflowY) || SCROLLABLE.test(style.overflowX)) {
      AXES.filter((axis) => !stuck.has(axis)).forEach((axis) => tracks.push({ source: node as Element, axis }));
      stuck.clear();
    }
    if (style.position === 'sticky') {
      stickyAxes(style).forEach((axis) => stuck.add(axis));
    }
  }
  if (document.scrollingElement) {
    const page = document.scrollingElement;
    AXES.filter((axis) => !stuck.has(axis)).forEach((axis) => tracks.push({ source: page, axis }));
  }
  return tracks;
}

export function scrollersOf(origin: Element): Element[] {
  return [...new Set(scrollTracksOf(origin).map((track) => track.source))];
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

export function txAnchorPane(overlayRef: OverlayRef, origin: Element, chrome?: TxOverlayInsets): () => void {
  const host = overlayRef.hostElement;
  const pane = overlayRef.overlayElement;
  const Timeline = scrollTimeline(origin.ownerDocument.defaultView);
  if (!Timeline || typeof host.animate !== 'function') {
    return () => undefined;
  }
  const tracks = scrollTracksOf(origin)
    .filter((track) => range(track) > 0)
    .slice(0, 2);
  if (!tracks.length) {
    return () => undefined;
  }

  const layers = [pane, host].slice(0, tracks.length);
  const animations = layers.map((layer, index) =>
    layer.animate([], { timeline: new Timeline(tracks[index]), fill: 'both' }),
  );

  let placed = '';
  let ranges = '';
  let origins: number[] = [];
  const follow = (force = false) => {
    const { top, right, bottom, left, transform } = pane.style;
    const placement = [top, right, bottom, left, transform].join('|');
    const measured = tracks.map(range).join('|');
    if (!force && placement === placed && measured === ranges) {
      return;
    }
    if (force || placement !== placed) {
      origins = tracks.map(offset);
    }
    placed = placement;
    ranges = measured;
    tracks.forEach((track, index) => {
      const base = layers[index] === pane ? `${pane.style.transform} `.trimStart() : '';
      const from = origins[index];
      (animations[index].effect as KeyframeEffect).setKeyframes([
        { transform: `${base}${shift(track, from)}` },
        { transform: `${base}${shift(track, from - range(track))}` },
      ]);
    });
  };

  const observer = new MutationObserver(() => follow());
  observer.observe(pane, { attributes: true, attributeFilter: ['style'] });
  follow(true);

  const view = origin.ownerDocument.defaultView;
  const resizes = view && 'ResizeObserver' in view ? new view.ResizeObserver(() => follow()) : null;
  tracks.forEach(({ source }) => {
    const content = source === source.ownerDocument.scrollingElement ? [source, source.ownerDocument.body] : [source, ...Array.from(source.children)];
    content.forEach((element) => resizes?.observe(element));
  });

  const document = origin.ownerDocument;
  const clip = () => {
    const { top, bottom } = chrome?.measure() ?? { top: 0, bottom: 0 };
    host.style.clipPath = top || bottom ? `inset(${top}px 0 ${bottom}px 0)` : '';
  };
  const clipsChrome = !!chrome && tracks.length === 1;
  if (clipsChrome) {
    clip();
    document.addEventListener('scroll', clip, { capture: true, passive: true });
  }

  let released = false;
  const release = () => {
    if (released) {
      return;
    }
    released = true;
    observer.disconnect();
    resizes?.disconnect();
    subscription.unsubscribe();
    animations.forEach((animation) => animation.cancel());
    if (clipsChrome) {
      document.removeEventListener('scroll', clip, { capture: true });
      host.style.removeProperty('clip-path');
    }
  };
  const subscription = overlayRef.detachments().subscribe(release);
  return release;
}

@Directive({ selector: '[cdkConnectedOverlay][txOverlayAnchor]' })
export class TxOverlayAnchor {
  private connectedOverlay = inject(CdkConnectedOverlay);
  private chrome = inject(TxOverlayInsets);
  private release: () => void = () => undefined;

  constructor() {
    const subscription = this.connectedOverlay.attach.subscribe(() => {
      this.release();
      const overlayRef = this.connectedOverlay.overlayRef;
      const origin = this.originElement();
      if (overlayRef && origin) {
        this.release = txAnchorPane(overlayRef, origin, this.chrome);
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
