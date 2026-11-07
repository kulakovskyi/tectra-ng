import { FocusTrapFactory } from '@angular/cdk/a11y';
import { createBlockScrollStrategy, createGlobalPositionStrategy, createOverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, Injector, TemplateRef, ViewContainerRef } from '@angular/core';

const LEAVE_LIMIT = 450;

export interface TxImageLayerOptions {
  injector: Injector;
  viewContainerRef: ViewContainerRef;
  focus?: string;
  onEscape?: () => void;
  onDetach?: () => void;
}

export interface TxImageLayer {
  readonly element: HTMLElement;
  close(): Promise<void>;
}

function animationsOf(element: HTMLElement): Animation[] {
  return typeof element.getAnimations === 'function' ? element.getAnimations({ subtree: true }) : [];
}

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
