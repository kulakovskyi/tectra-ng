import { ViewportMargin } from '@angular/cdk/overlay';
import { Injectable, inject } from '@angular/core';
import { TECTRA_CONFIG } from '@tectra/core/config';
import { TxOverlayInsetValues } from './overlay.types';

const STUCK_TOLERANCE = 1;

@Injectable({ providedIn: 'root' })
export class TxOverlayInsets {
  private configured = inject(TECTRA_CONFIG, { optional: true })?.overlay?.viewportInsets;
  private elements = new Set<HTMLElement>();

  register(element: HTMLElement): () => void {
    this.elements.add(element);
    return () => this.elements.delete(element);
  }

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

export function txViewportMargin(insets: TxOverlayInsetValues, margin: number): ViewportMargin {
  return { top: insets.top + margin, bottom: insets.bottom + margin, start: margin, end: margin };
}

export function isOriginHidden(origin: Element, insets: TxOverlayInsetValues): boolean {
  const rect = origin.getBoundingClientRect();
  const height = origin.ownerDocument.defaultView?.innerHeight ?? 0;
  return rect.bottom <= insets.top || rect.top >= height - insets.bottom;
}

export interface TxOriginWatch {
  hidden: () => void;
  insetsChange?: (insets: TxOverlayInsetValues) => void;
}

export function watchOrigin(origin: Element, overlayInsets: TxOverlayInsets, watch: TxOriginWatch): () => void {
  const document = origin.ownerDocument;
  const listener = () => {
    const insets = overlayInsets.measure();
    if (isOriginHidden(origin, insets)) {
      watch.hidden();
      return;
    }
    watch.insetsChange?.(insets);
  };
  document.addEventListener('scroll', listener, { capture: true, passive: true });
  return () => document.removeEventListener('scroll', listener, { capture: true });
}
