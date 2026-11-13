import { FocusTrapFactory } from '@angular/cdk/a11y';
import { createBlockScrollStrategy, createGlobalPositionStrategy, createOverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, Injector, TemplateRef, ViewContainerRef } from '@angular/core';

const LEAVE_LIMIT = 450;

/** Options of `openImageLayer`. */
export interface TxImageLayerOptions {
  /** Injector used to create the overlay and the focus trap. */
  injector: Injector;
  /** View container the layer template is attached through. */
  viewContainerRef: ViewContainerRef;
  /** CSS selector of the element to focus first; the first focusable one when empty. */
  focus?: string;
  /** Called when Escape is pressed in the layer. */
  onEscape?: () => void;
  /** Called when the layer is removed by something other than `close`, such as navigation. */
  onDetach?: () => void;
}

/** Handle of an open image layer. */
export interface TxImageLayer {
  /** Overlay element that holds the layer content. */
  readonly element: HTMLElement;
  /** Fades the layer out, removes it and returns focus; resolves when it is gone. */
  close(): Promise<void>;
}

function animationsOf(element: HTMLElement): Animation[] {
  return typeof element.getAnimations === 'function' ? element.getAnimations({ subtree: true }) : [];
}

/**
 * Opens a full-screen layer from a template with focus trap, scroll lock and fade-out; used by `tx-
 * image` previews.
 */
export function openImageLayer(template: TemplateRef<unknown>, options: TxImageLayerOptions): TxImageLayer {
  const { injector } = options;
  const document = injector.get(DOCUMENT);
  const previousFocus = document.activeElement as HTMLElement | null;
  const overlayRef = createOverlayRef(injector, {
    positionStrategy: createGlobalPositionStrategy(injector).top('0').left('0'),
    scrollStrategy: createBlockScrollStrategy(injector),
    width: '100%',
    height: '100%',
    panelClass: 'tx-image-layer',
    usePopover: false,
    disposeOnNavigation: true,
  });
  overlayRef.hostElement.style.zIndex = 'var(--tx-layer-modal)';
  const view = overlayRef.attach(new TemplatePortal(template, options.viewContainerRef));
  view.detectChanges();
  const element = overlayRef.overlayElement;
  const focusTrap = injector.get(FocusTrapFactory).create(element);
  const target = (options.focus ? element.querySelector<HTMLElement>(options.focus) : null) ?? element.querySelector<HTMLElement>('[tabindex], button, a[href]');
  target?.focus({ preventScroll: true });
  let closing: Promise<void> | null = null;

  overlayRef.keydownEvents().subscribe((event) => {
    if (event.key === 'Escape' && !closing) {
      event.preventDefault();
      options.onEscape?.();
    }
  });
  overlayRef.detachments().subscribe(() => {
    if (!closing) {
      options.onDetach?.();
    }
  });

  return {
    element,
    close(): Promise<void> {
      if (closing) {
        return closing;
      }
      Array.from(element.children).forEach((child) => child.classList.add('tx-image-layer--leaving'));
      element.style.pointerEvents = 'none';
      const animations = animationsOf(element);
      const finished = Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))).then(() => undefined);
      closing = (animations.length ? Promise.race([finished, new Promise<void>((resolve) => setTimeout(resolve, LEAVE_LIMIT))]) : finished).then(() => {
        focusTrap.destroy();
        overlayRef.dispose();
        if (previousFocus?.isConnected) {
          previousFocus.focus({ preventScroll: true });
        }
      });
      return closing;
    },
  };
}
