import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
  OverlayRef,
  createBlockScrollStrategy,
  createCloseScrollStrategy,
  createFlexibleConnectedPositionStrategy,
  createNoopScrollStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { DOCUMENT, Injectable, Injector, TemplateRef, Type, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { txAnimateEnter, txAnimateLeave } from './overlay-motion';
import { placementFromPosition, txPositions } from './placements';
import { TxOverlayCloseReason, TxOverlayOptions, TxOverlayRef, TxOverlayScroll } from './overlay.types';

@Injectable({ providedIn: 'root' })
export class TxOverlay {
  private injector = inject(Injector);
  private document = inject(DOCUMENT);

  open<TInstance = unknown, TContext = unknown>(
    content: TemplateRef<TContext> | Type<TInstance>,
    options: TxOverlayOptions<TContext>,
  ): TxOverlayRef<TInstance> {
    const injector = options.injector ?? this.injector;
    const placement = options.placement ?? 'bottom-start';
    const origin = options.origin as HTMLElement;
    const previousFocus = this.document.activeElement as HTMLElement | null;

    const positionStrategy = createFlexibleConnectedPositionStrategy(injector, origin)
      .withPositions(txPositions(placement, options.offset ?? 4))
      .withFlexibleDimensions(false)
      .withViewportMargin(options.viewportMargin ?? 8)
      .withPush(false);

    const overlayRef = createOverlayRef(injector, {
      positionStrategy,
      scrollStrategy: this.scrollStrategy(injector, options.scroll ?? 'reposition'),
      panelClass: ['tx-overlay-pane', ...[options.panelClass ?? []].flat()],
      width: options.matchWidth ? origin.getBoundingClientRect().width : undefined,
    });
    overlayRef.hostElement.style.zIndex = `var(--tx-layer-${options.layer ?? 'dropdown'})`;

    const currentPlacement = signal(placement);
    const closed = new Subject<TxOverlayCloseReason>();
    let isClosed = false;

    const animate = options.animate !== false;
    const close = (reason: TxOverlayCloseReason = 'api') => {
      if (isClosed) {
        return;
      }
      isClosed = true;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      if (options.restoreFocus !== false && reason !== 'outside' && previousFocus?.isConnected) {
        previousFocus.focus();
      }
      closed.next(reason);
      closed.complete();
      const leave = animate && overlayRef.hasAttached() ? txAnimateLeave(overlayRef.overlayElement, currentPlacement()) : Promise.resolve();
      leave.then(() => overlayRef.dispose());
    };

    const subscriptions = [
      positionStrategy.positionChanges.subscribe((change) => {
        const next = placementFromPosition(change.connectionPair);
        if (next) {
          currentPlacement.set(next);
        }
      }),
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && options.closeOnEscape !== false) {
          event.preventDefault();
          close('escape');
        }
      }),
      overlayRef.outsidePointerEvents().subscribe((event) => {
        if (options.closeOnOutsideClick !== false && !origin.contains(event.target as Node)) {
          close('outside');
        }
      }),
      overlayRef.detachments().subscribe(() => close(options.scroll === 'close' ? 'scroll' : 'detached')),
    ];

    const instance = this.attach(overlayRef, content, options);
    if (animate) {
      overlayRef.updatePosition();
      txAnimateEnter(overlayRef.overlayElement, currentPlacement());
    }

    return {
      placement: currentPlacement.asReadonly(),
      closed: closed.asObservable(),
      instance,
      element: overlayRef.overlayElement,
      close,
      updatePosition: () => overlayRef.updatePosition(),
    };
  }

  private attach<TInstance, TContext>(
    overlayRef: OverlayRef,
    content: TemplateRef<TContext> | Type<TInstance>,
    options: TxOverlayOptions<TContext>,
  ): TInstance | null {
    if (content instanceof TemplateRef) {
      if (!options.viewContainerRef) {
        throw new Error('TxOverlay: a template needs options.viewContainerRef');
      }
      overlayRef.attach(new TemplatePortal(content, options.viewContainerRef, options.context as TContext));
      return null;
    }
    return overlayRef.attach(new ComponentPortal(content, options.viewContainerRef ?? null, options.injector)).instance;
  }

  private scrollStrategy(injector: Injector, scroll: TxOverlayScroll) {
    switch (scroll) {
      case 'close':
        return createCloseScrollStrategy(injector);
      case 'block':
        return createBlockScrollStrategy(injector);
      case 'none':
        return createNoopScrollStrategy();
      default:
        return createRepositionScrollStrategy(injector);
    }
  }
}
