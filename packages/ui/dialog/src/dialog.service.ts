import { ComponentPortal } from '@angular/cdk/portal';
import { createBlockScrollStrategy, createGlobalPositionStrategy, createNoopScrollStrategy, createOverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT, Injectable, Injector, TemplateRef, Type, inject, signal } from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxOverlayStack } from '@tectra-ng/core/overlay';
import { TX_DIALOG_CURRENT, TX_DIALOG_DATA, TxDialogRef } from './dialog-ref';
import { TxDialogContainer } from './dialog-container.component';
import { TxDialogConfig, TxDialogTemplateContext } from './dialog.types';

/** Opens dialogs and drawers from a component or a template and keeps track of the open ones. */
@Injectable({ providedIn: 'root' })
export class TxDialogService {
  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private stack = inject(TxOverlayStack);
  private readonly dialogs = signal<TxDialogRef[]>([]);

  /** The dialogs that are open now, the last opened last. */
  readonly openDialogs = this.dialogs.asReadonly();

  /** Opens a component or a template in a dialog and returns its `TxDialogRef`. */
  open<C = unknown, D = unknown, R = unknown>(
    content: Type<C> | TemplateRef<TxDialogTemplateContext<D, R>>,
    config: TxDialogConfig<D, R> = {},
  ): TxDialogRef<R, C> {
    const parent = config.injector ?? config.viewContainerRef?.injector ?? this.injector;
    const modal = config.modal !== false;
    if (modal) {
      this.stack.closeTransient();
    }
    const previousFocus = this.document.activeElement as HTMLElement | null;
    const overlayRef = createOverlayRef(parent, {
      positionStrategy: createGlobalPositionStrategy(parent).top('0').left('0'),
      scrollStrategy: modal && config.blockScroll !== false ? createBlockScrollStrategy(parent) : createNoopScrollStrategy(),
      width: '100%',
      height: '100%',
      panelClass: 'tx-dialog-pane',
      disposeOnNavigation: true,
    });
    overlayRef.hostElement.style.zIndex = 'var(--tx-layer-modal)';

    const ref = new TxDialogRef<R, C>(uniqueId('tx-dialog'), config as TxDialogConfig<unknown, R>);
    const injector = Injector.create({
      parent,
      providers: [
        { provide: TxDialogRef, useValue: ref },
        { provide: TX_DIALOG_DATA, useValue: config.data },
        { provide: TX_DIALOG_CURRENT, useValue: signal(ref) },
      ],
    });
    const container = overlayRef.attach(new ComponentPortal(TxDialogContainer, null, injector));
    if (!modal) {
      overlayRef.overlayElement.style.pointerEvents = 'none';
      overlayRef.hostElement.style.pointerEvents = 'none';
    }
    container.changeDetectorRef.detectChanges();
    const componentRef = container.instance.attach(content, injector, config.data);
    ref.componentInstance = componentRef?.instance ?? null;
    container.changeDetectorRef.detectChanges();

    ref.attachHost({
      leave: () => container.instance.leave(),
      dispose: () => {
        overlayRef.dispose();
        this.dialogs.update((dialogs) => dialogs.filter((dialog) => dialog !== ref));
        if (config.restoreFocus !== false && previousFocus?.isConnected) {
          previousFocus.focus({ preventScroll: true });
        }
      },
      updateSize: (width, height) => container.instance.updateSize(width, height),
      dragFrom: (event) => container.instance.dragFrom(event),
    });

    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' && (config.closeOnEscape ?? config.closable ?? true)) {
        event.preventDefault();
        void ref.close();
      }
    });
    overlayRef.detachments().subscribe(() => {
      if (!ref.isClosing) {
        void ref.close();
      }
    });

    this.dialogs.update((dialogs) => [...dialogs, ref as TxDialogRef]);
    if (modal) {
      this.stack.raise();
    }
    container.instance.enter();
    ref.markOpened();
    return ref;
  }

  /** Closes every open dialog, the last opened first. */
  closeAll(): void {
    [...this.dialogs()].reverse().forEach((dialog) => void dialog.close());
  }
}
