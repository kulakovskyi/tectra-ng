import { CdkConnectedOverlay, OverlayRef } from '@angular/cdk/overlay';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

type Side = 'top' | 'right' | 'bottom' | 'left';

const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];
let anchorCount = 0;

export function supportsAnchors(view: Window | null): boolean {
  const css = (view as (Window & typeof globalThis) | null)?.CSS;
  return typeof css?.supports === 'function' && css.supports('anchor-name', '--tx-anchor');
}

function anchorNames(element: HTMLElement): string[] {
  return element.style
    .getPropertyValue('anchor-name')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.startsWith('--'));
}

function distance(side: Side, origin: DOMRect, box: DOMRect): number {
  switch (side) {
    case 'top':
      return origin.top - box.top;
    case 'bottom':
      return box.bottom - origin.bottom;
    case 'left':
      return origin.left - box.left;
    case 'right':
      return box.right - origin.right;
  }
}

export function txAnchorPane(overlayRef: OverlayRef, origin: Element): () => void {
  const pane = overlayRef.overlayElement;
  const host = origin as HTMLElement;
  if (!supportsAnchors(origin.ownerDocument.defaultView) || !host.style) {
    return () => undefined;
  }
  const name = `--tx-anchor-${++anchorCount}`;
  host.style.setProperty('anchor-name', [...anchorNames(host), name].join(', '));
  pane.style.setProperty('position-anchor', name);

  const pin = () => {
    const placed = SIDES.filter((side) => pane.style.getPropertyValue(side).endsWith('px'));
    if (!placed.length) {
      return;
    }
    const originBox = origin.getBoundingClientRect();
    const box = overlayRef.hostElement.getBoundingClientRect();
    for (const side of placed) {
      const value = parseFloat(pane.style.getPropertyValue(side));
      const edge = distance(side, originBox, box);
      pane.style.setProperty(side, `calc(anchor(${side}, ${edge}px) + ${value - edge}px)`);
    }
  };

  const observer = new MutationObserver(pin);
  observer.observe(pane, { attributes: true, attributeFilter: ['style'] });
  pin();

  let released = false;
  const release = () => {
    if (released) {
      return;
    }
    released = true;
    observer.disconnect();
    subscription.unsubscribe();
    pane.style.removeProperty('position-anchor');
    const rest = anchorNames(host).filter((other) => other !== name);
    if (rest.length) {
      host.style.setProperty('anchor-name', rest.join(', '));
    } else {
      host.style.removeProperty('anchor-name');
    }
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
