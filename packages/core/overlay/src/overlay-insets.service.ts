import { ViewportMargin } from '@angular/cdk/overlay';
import { Injectable, inject } from '@angular/core';
import { TECTRA_CONFIG } from '@tectra-ng/core/config';
import { TxOverlayBounds, TxOverlayInsetValues } from './overlay.types';
import { txFollowsScroll } from './overlay-scroll';

const STUCK_TOLERANCE = 1;

/**
 * Measures the space that fixed or stuck bars (marked with `txOverlayInset`) and the config take at the top
 * and bottom of the viewport.
 */
@Injectable({ providedIn: 'root' })
export class TxOverlayInsets {
  private configured = inject(TECTRA_CONFIG, { optional: true })?.overlay?.viewportInsets;
  private elements = new Set<HTMLElement>();

  /** Adds an element to measure; returns a function that removes it. */
  register(element: HTMLElement): () => void {
    this.elements.add(element);
    return () => this.elements.delete(element);
  }

  /**
   * Space taken now at the top and bottom, in px: the configured insets or the registered elements pinned to
   * an edge, whichever is larger.
   */
  measure(): TxOverlayInsetValues {
    const insets = { top: this.configured?.top ?? 0, bottom: this.configured?.bottom ?? 0 };
    for (const element of this.elements) {
      const view = element.ownerDocument.defaultView;
      const rect = element.getBoundingClientRect();
      if (!view || !rect.height || !isPinned(element, rect, view)) {
        continue;
      }
      if (rect.top + rect.height / 2 < view.innerHeight / 2) {
        insets.top = Math.max(insets.top, rect.bottom);
      } else {
        insets.bottom = Math.max(insets.bottom, view.innerHeight - rect.top);
      }
    }
    return insets;
  }
}

function isPinned(element: HTMLElement, rect: DOMRect, view: Window): boolean {
  const style = view.getComputedStyle(element);
  if (style.position === 'fixed') {
    return true;
  }
  if (style.position !== 'sticky') {
    return false;
  }
  const top = parseFloat(style.top);
  const bottom = parseFloat(style.bottom);
  return (
    (!Number.isNaN(top) && Math.abs(rect.top - top) < STUCK_TOLERANCE) ||
    (!Number.isNaN(bottom) && Math.abs(view.innerHeight - rect.bottom - bottom) < STUCK_TOLERANCE)
  );
}

/** Viewport margin for an overlay: the free margin on every side plus the space taken by fixed bars. */
export function txViewportMargin(insets: TxOverlayInsetValues, margin: number): ViewportMargin {
  return { top: insets.top + margin, bottom: insets.bottom + margin, start: margin, end: margin };
}

/**
 * Viewport margin for connected overlays: the free margin at the bottom and sides, plus the space of a bottom
 * bar; the top margin is 0.
 */
export function txConnectedMargin(insets: TxOverlayInsetValues, margin: number): ViewportMargin {
  return { top: 0, bottom: insets.bottom + margin, start: margin, end: margin };
}

/** Area of the viewport an overlay may use: the viewport minus the margin and the space taken by fixed bars. */
export function txOverlayBounds(insets: TxOverlayInsetValues, margin: number, document: Document): TxOverlayBounds {
  const { clientWidth, clientHeight } = document.documentElement;
  return { top: insets.top + margin, right: clientWidth - margin, bottom: clientHeight - insets.bottom - margin, left: margin };
}

/** Callbacks of `watchOrigin`. */
export interface TxOriginWatch {
  /** Called with the new bar insets when the page scrolls. */
  insetsChange: (insets: TxOverlayInsetValues) => void;
  /** Called when a scrollable ancestor of the origin scrolls. */
  containerScroll: () => void;
}

const SCROLLABLE = /(auto|scroll)/;

/** Scrollable ancestors of an element, nearest first, up to but not including the page. */
export function scrollContainers(origin: Element): Element[] {
  const document = origin.ownerDocument;
  const view = document.defaultView;
  const containers: Element[] = [];
  for (let node = origin.parentElement; node && view && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const style = view.getComputedStyle(node);
    if ([style.overflow, style.overflowX, style.overflowY].some((value) => SCROLLABLE.test(value))) {
      containers.push(node);
    }
  }
  return containers;
}

/**
 * Watches an origin element: reports new bar insets when the page scrolls and when a scrollable ancestor
 * scrolls; returns a function that stops it.
 */
export function watchOrigin(origin: Element, overlayInsets: TxOverlayInsets, watch: TxOriginWatch): () => void {
  const document = origin.ownerDocument;
  const containers = scrollContainers(origin);
  const onContainer = () => watch.containerScroll();
  containers.forEach((container) => container.addEventListener('scroll', onContainer, { passive: true }));
  const follows = txFollowsScroll(document.defaultView);
  const onPage = (event: Event) => {
    if (event.target === document || event.target === document.documentElement || event.target === document.body) {
      watch.insetsChange(overlayInsets.measure());
    }
  };
  if (!follows) {
    document.addEventListener('scroll', onPage, { capture: true, passive: true });
  }
  return () => {
    containers.forEach((container) => container.removeEventListener('scroll', onContainer));
    document.removeEventListener('scroll', onPage, { capture: true });
  };
}
