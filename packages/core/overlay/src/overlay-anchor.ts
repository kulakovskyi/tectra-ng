import { CdkConnectedOverlay, OverlayRef } from '@angular/cdk/overlay';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { TxOverlayInsets } from './overlay-insets.service';
import { ScrollAxis, scrollTimeline } from './overlay-scroll';
import { txCrossShift, txHostGap, txLayoutOrigin, txLayoutShift } from './overlay-viewport';

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

const anchoredPanes = new WeakMap<Element, Element>();

function inTopLayer(element: Element): boolean {
  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
}

export function scrollTracksOf(origin: Element): ScrollTrack[] {
  const document = origin.ownerDocument;
  const view = document.defaultView;
  const tracks: ScrollTrack[] = [];
  const stuck = new Set<ScrollAxis>();
  for (let node: Element | null = origin.parentElement; node && view; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) {
      break;
    }
    const anchor = anchoredPanes.get(node);
    if (anchor) {
      node = anchor;
      continue;
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

function length(track: ScrollTrack): number {
  return track.axis === 'block' ? track.source.scrollHeight : track.source.scrollWidth;
}

function offset(track: ScrollTrack): number {
  return track.axis === 'block' ? track.source.scrollTop : track.source.scrollLeft;
}

function shift(track: ScrollTrack, by: number): string {
  return `${track.axis === 'block' ? 'translateY' : 'translateX'}(${by}px)`;
}

type RangedAnimation = Animation & { rangeEnd: string };

export function txAnchorPane(overlayRef: OverlayRef, origin: Element, chrome?: TxOverlayInsets, margin = 8): () => void {
  const host = overlayRef.hostElement;
  const pane = overlayRef.overlayElement;
  const document = origin.ownerDocument;
  const view = document.defaultView;
  const Timeline = scrollTimeline(view);
  const page = document.scrollingElement;
  const following = scrollTracksOf(origin);
  const carried = !!page && following.filter((track) => track.source === page).length === 2 && inTopLayer(host);
  const tracks =
    Timeline && typeof host.animate === 'function'
      ? following
          .filter((track) => !carried || track.source !== page)
          .filter((track) => range(track) > 0)
          .slice(0, 2)
      : [];
  const pageAxes = new Set(tracks.filter((track) => track.source === page).map((track) => track.axis));

  const layers = [pane, host].slice(0, tracks.length);
  const animations = Timeline
    ? layers.map(
        (layer, index) =>
          layer.animate([], { timeline: new Timeline(tracks[index]), fill: 'both', rangeStart: '0px', rangeEnd: `${length(tracks[index])}px` }) as RangedAnimation,
      )
    : [];

  let lead = txLayoutShift(document);
  let cross = { x: 0, y: 0 };
  const nudge = () => {
    const gap = txHostGap(host, pane);
    const now = pageAxes.size ? txLayoutShift(document) : lead;
    const x = gap.x + cross.x + (pageAxes.has('inline') ? now.x - lead.x : 0);
    const y = gap.y + cross.y + (pageAxes.has('block') ? now.y - lead.y : 0);
    const translate = x || y ? `${x}px ${y}px` : '';
    if (pane.style.translate !== translate) {
      pane.style.translate = translate;
    }
  };
  const fit = () => {
    cross = txCrossShift(pane, margin);
    const along = cross.x ? (overlayRef.getDirection() === 'rtl' ? -cross.x : cross.x) : cross.y;
    const shift = along ? `${along}px` : '';
    if (pane.style.getPropertyValue('--tx-overlay-shift') !== shift) {
      if (shift) {
        pane.style.setProperty('--tx-overlay-shift', shift);
      } else {
        pane.style.removeProperty('--tx-overlay-shift');
      }
    }
  };

  const carry = () => {
    if (!carried) {
      return;
    }
    const at = txLayoutOrigin(document);
    host.style.position = 'absolute';
    host.style.translate = `${at.x}px ${at.y}px`;
  };

  let placed = '';
  let lengths = '';
  let origins: number[] = [];
  const follow = (force = false) => {
    const { top, right, bottom, left, transform } = pane.style;
    const placement = [top, right, bottom, left, transform].join('|');
    const measured = tracks.map(length).join('|');
    const moved = force || placement !== placed;
    if (moved) {
      origins = tracks.map(offset);
      lead = txLayoutShift(document);
      carry();
    }
    if (moved || measured !== lengths) {
      placed = placement;
      lengths = measured;
      tracks.forEach((track, index) => {
        const base = layers[index] === pane ? `${pane.style.transform} `.trimStart() : '';
        const from = origins[index];
        const end = length(track);
        animations[index].rangeEnd = `${end}px`;
        (animations[index].effect as KeyframeEffect).setKeyframes([
          { transform: `${base}${shift(track, from)}` },
          { transform: `${base}${shift(track, from - end)}` },
        ]);
      });
    }
    fit();
    nudge();
  };

  anchoredPanes.set(pane, origin);
  const observer = new MutationObserver(() => follow());
  observer.observe(pane, { attributes: true, attributeFilter: ['style'] });
  follow(true);

  const resizes = view && 'ResizeObserver' in view ? new view.ResizeObserver(() => follow()) : null;
  resizes?.observe(host);
  resizes?.observe(pane);
  tracks.forEach(({ source }) => {
    const content = source === document.scrollingElement ? [source, document.body] : [source, ...Array.from(source.children)];
    content.forEach((element) => resizes?.observe(element));
  });

  const viewport = pageAxes.size ? view?.visualViewport : undefined;
  viewport?.addEventListener('scroll', nudge, { passive: true });
  viewport?.addEventListener('resize', nudge, { passive: true });

  const settled = () => ({ left: page?.scrollLeft ?? 0, top: page?.scrollTop ?? 0 });
  let seen = settled();
  const note = () => (seen = settled());
  const keep = () => {
    const now = settled();
    if (page && (now.left !== seen.left || now.top !== seen.top)) {
      page.scrollTo({ ...seen, behavior: 'instant' });
    }
  };
  const screen = carried ? view?.visualViewport : undefined;
  const reveal = () => {
    const field = document.activeElement;
    if (!screen || !page || Math.abs(screen.scale - 1) > 0.01 || !field || !pane.contains(field)) {
      return;
    }
    const panel = pane.getBoundingClientRect();
    const fits = panel.height <= screen.height - margin * 2;
    const bottom = (fits ? panel : field.getBoundingClientRect()).bottom + txLayoutShift(document).y;
    const hidden = bottom - (screen.offsetTop + screen.height - margin);
    if (hidden > 0) {
      page.scrollBy({ top: hidden, behavior: 'instant' });
    }
  };
  if (carried) {
    pane.addEventListener('focusin', keep);
    document.addEventListener('scroll', note, { passive: true });
    screen?.addEventListener('resize', reveal, { passive: true });
  }

  const clip = () => {
    const { top, bottom } = chrome?.measure() ?? { top: 0, bottom: 0 };
    const box = host.getBoundingClientRect();
    const height = view?.innerHeight ?? box.bottom;
    host.style.clipPath = top || bottom ? `inset(${top ? top - box.top : 0}px 0 ${bottom ? box.bottom - height + bottom : 0}px 0)` : '';
  };
  const clipsChrome = !!chrome && tracks.length + (carried ? 1 : 0) === 1;
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
    anchoredPanes.delete(pane);
    observer.disconnect();
    resizes?.disconnect();
    viewport?.removeEventListener('scroll', nudge);
    viewport?.removeEventListener('resize', nudge);
    subscription.unsubscribe();
    animations.forEach((animation) => animation.cancel());
    if (clipsChrome) {
      document.removeEventListener('scroll', clip, { capture: true });
      host.style.removeProperty('clip-path');
    }
    if (carried) {
      pane.removeEventListener('focusin', keep);
      document.removeEventListener('scroll', note);
      screen?.removeEventListener('resize', reveal);
      host.style.removeProperty('position');
      host.style.removeProperty('translate');
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
