import { TxOverlayBox, TxOverlayShift } from './overlay.types';

/** Offset between the layout viewport and the visual viewport of the page, in px (differs when pinch-zoomed). */
export function txLayoutShift(document: Document): TxOverlayShift {
  const viewport = document.defaultView?.visualViewport;
  const page = document.scrollingElement;
  if (!viewport || !page) {
    return { x: 0, y: 0 };
  }
  return {
    x: Math.round(page.scrollLeft - viewport.pageLeft + viewport.offsetLeft),
    y: Math.round(page.scrollTop - viewport.pageTop + viewport.offsetTop),
  };
}

/** Page position of the top left corner of the visual viewport, in px. */
export function txLayoutOrigin(document: Document): TxOverlayShift {
  const viewport = document.defaultView?.visualViewport;
  const page = document.scrollingElement;
  if (viewport) {
    return { x: viewport.pageLeft - viewport.offsetLeft, y: viewport.pageTop - viewport.offsetTop };
  }
  return { x: page?.scrollLeft ?? 0, y: page?.scrollTop ?? 0 };
}

/** Rectangle of an element in layout viewport coordinates, in px. */
export function txLayoutRect(element: Element): TxOverlayBox {
  const { top, left, width, height } = element.getBoundingClientRect();
  const shift = txLayoutShift(element.ownerDocument);
  return { top: top + shift.y, left: left + shift.x, width, height };
}

/** Space between the overlay host and the root element on the sides the pane is pinned to, in px. */
export function txHostGap(host: HTMLElement, pane: HTMLElement): TxOverlayShift {
  const root = host.ownerDocument.documentElement;
  return {
    x: pane.style.right ? root.clientWidth - host.clientWidth : 0,
    y: pane.style.bottom ? root.clientHeight - host.clientHeight : 0,
  };
}

function crossShift(start: number, size: number, limit: number, margin: number): number {
  if (size > limit - margin * 2 || start < margin) {
    return margin - start;
  }
  return Math.min(limit - margin - start - size, 0);
}

function sideOf(pane: HTMLElement): string | null {
  const placement = Array.from(pane.classList).find((name) => name.startsWith('tx-placement-'));
  return placement ? placement.slice('tx-placement-'.length).split('-')[0] : null;
}

/** Shift that keeps an overlay inside the viewport across its placement side, in px; zero when it already fits. */
export function txCrossShift(pane: HTMLElement, margin: number): TxOverlayShift {
  const side = sideOf(pane);
  const root = pane.ownerDocument.documentElement;
  const { top, right, bottom, left } = pane.style;
  if ((side === 'top' || side === 'bottom') && (left || right)) {
    const width = pane.offsetWidth;
    const start = left ? parseFloat(left) : root.clientWidth - parseFloat(right) - width;
    return { x: crossShift(start, width, root.clientWidth, margin), y: 0 };
  }
  if ((side === 'left' || side === 'right') && (top || bottom)) {
    const height = pane.offsetHeight;
    const start = top ? parseFloat(top) : root.clientHeight - parseFloat(bottom) - height;
    return { x: 0, y: crossShift(start, height, root.clientHeight, margin) };
  }
  return { x: 0, y: 0 };
}
