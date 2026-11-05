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
import { orderByRoom, placementFromPosition, txPositions } from './placements';
import { TxOverlayCloseReason, TxOverlayOptions, TxOverlayRef, TxOverlayScroll } from './overlay.types';
import { TxOverlayInsets, txConnectedMargin, txOverlayBounds, watchOrigin } from './overlay-insets.service';

@Injectable({ providedIn: 'root' })
export class TxOverlay {
  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private overlayInsets = inject(TxOverlayInsets);

  open<TInstance = unknown, TContext = unknown>(
    content: TemplateRef<TContext> | Type<TInstance>,
    options: TxOverlayOptions<TContext>,
  ): TxOverlayRef<TInstance> {
    const injector = options.injector ?? this.injector;
    const placement = options.placement ?? 'bottom-start';
    const origin = options.origin as HTMLElement;
    const previousFocus = this.document.activeElement as HTMLElement | null;

    const margin = options.viewportMargin ?? 8;
    const positions = txPositions(placement, options.offset ?? 4);
    let insets = this.overlayInsets.measure();
    const positionStrategy = createFlexibleConnectedPositionStrategy(injector, origin)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withViewportMargin(txConnectedMargin(insets, margin))
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
    const motion = options.motion ?? 'slide';
    const motionTarget = () => overlayRef.overlayElement.firstElementChild ?? overlayRef.overlayElement;
    const close = (reason: TxOverlayCloseReason = 'api') => {
      if (isClosed) {
        return;
      }
      isClosed = true;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      stopWatchingOrigin();
      if (options.restoreFocus !== false && reason !== 'outside' && previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: reason === 'scroll' });
      }
      closed.next(reason);
      closed.complete();
      let leave = Promise.resolve();
      if (animate && overlayRef.hasAttached()) {
        overlayRef.overlayElement.style.pointerEvents = 'none';
        leave = txAnimateLeave(motionTarget(), currentPlacement(), motion, origin);
      }
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

    const scroll = options.scroll ?? 'reposition';
    const stopWatchingOrigin =
      scroll === 'reposition'
        ? watchOrigin(origin, this.overlayInsets, {
            hidden: () => close('scroll'),
            insetsChange: (next) => {
              insets = next;
              positionStrategy.withViewportMargin(txConnectedMargin(insets, margin));
              reposition();
            },
          })
        : () => undefined;

    const preferRoom = () => {
      const pane = overlayRef.overlayElement;
      const size = { width: pane.offsetWidth, height: pane.offsetHeight };
      positionStrategy.withPositions(orderByRoom(positions, origin.getBoundingClientRect(), size, txOverlayBounds(insets, margin, this.document)));
    };
    const reposition = () => {
      preferRoom();
      overlayRef.updatePosition();
    };

    const instance = this.attach(overlayRef, content, options);
    reposition();
    if (animate) {
      txAnimateEnter(motionTarget(), currentPlacement(), motion, origin);
    }

    return {
      placement: currentPlacement.asReadonly(),
      closed: closed.asObservable(),
      instance,
      element: overlayRef.overlayElement,
      close,
      updatePosition: reposition,
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
      overlayRef.attach(new TemplatePortal(content, options.viewContainerRef, options.context as TContext)).detectChanges();
      return null;
    }
    const componentRef = overlayRef.attach(new ComponentPortal(content, options.viewContainerRef ?? null, options.injector));
    componentRef.changeDetectorRef.detectChanges();
    return componentRef.instance;
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
