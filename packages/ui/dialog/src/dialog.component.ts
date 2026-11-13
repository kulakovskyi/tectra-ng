import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  WritableSignal,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TectraDeepPartial, TectraDialogTokens } from '@tectra-ng/themes';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TX_DIALOG_CURRENT, TxDialogRef } from './dialog-ref';
import { TxDialogContent, TxDialogHeader } from './dialog-parts.component';
import { TxDialogService } from './dialog.service';
import { TxDialogAutoFocus, TxDialogPosition, TxDialogRole, TxDialogSize, TxDialogTemplateContext, TxDrawerPosition, TxDrawerSize } from './dialog.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { DIALOG_ICON_DEFAULTS } from './dialog.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { DIALOG_THEME } from './dialog.theme';

@Component({
  selector: 'tx-dialog',
  imports: [TxDialogHeader, TxDialogContent],
  template: `
    <ng-template #body>
      @if (header()) {
        <tx-dialog-header [title]="header()" [subtitle]="subtitle()" />
      }
      <ng-content select="tx-dialog-header" />
      <tx-dialog-content>
        <ng-content />
      </tx-dialog-content>
      <ng-content select="tx-dialog-footer" />
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_DIALOG_CURRENT, useFactory: () => signal<TxDialogRef | null>(null) }],
  host: { class: 'tx-dialog-host', style: 'display: contents' },
  viewProviders: [provideTxIconDefaults(DIALOG_ICON_DEFAULTS)],
})
export class TxDialog {
  private readonly dialogTheme = injectTokens(DIALOG_THEME);

  private dialogs = inject(TxDialogService);
  private injector = inject(Injector);
  private current = inject(TX_DIALOG_CURRENT) as WritableSignal<TxDialogRef | null>;
  private destroyed = false;

  readonly visible = model(false);
  readonly header = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly size = input<TxDialogSize>('medium');
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly minWidth = input<string | undefined>(undefined);
  readonly maxWidth = input<string | undefined>(undefined);
  readonly maxHeight = input<string | undefined>(undefined);
  readonly breakpoints = input<Record<string, string> | undefined>(undefined);
  readonly position = input<TxDialogPosition>('center');
  readonly drawer = input<TxDrawerPosition | undefined>(undefined);
  readonly drawerSize = input<TxDrawerSize | (string & {})>('medium');
  readonly modal = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly closable = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly closeOnEscape = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly dismissableMask = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly blockScroll = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly draggable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly maximizable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly autoFocus = input<TxDialogAutoFocus>('first');
  readonly restoreFocus = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly role = input<TxDialogRole>('dialog');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly panelClass = input<string | undefined>(undefined);
  readonly canClose = input<(() => boolean | Promise<boolean>) | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraDialogTokens> | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly body = viewChild.required<TemplateRef<TxDialogTemplateContext>>('body');

  constructor() {
    effect(() => {
      const wanted = this.visible();
      untracked(() => {
        if (wanted && !this.current()) {
          this.open();
        } else if (!wanted && this.current()) {
          void this.current()?.close();
        }
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      void this.current()?.close();
    });
  }

  close(): void {
    void this.current()?.close();
  }

  private open(): void {
    const guard = this.canClose();
    const ref = this.dialogs.open(this.body(), {
      injector: this.injector,
      size: this.size(),
      width: this.width(),
      height: this.height(),
      minWidth: this.minWidth(),
      maxWidth: this.maxWidth(),
      maxHeight: this.maxHeight(),
      breakpoints: this.breakpoints(),
      position: this.position(),
      drawer: this.drawer(),
      drawerSize: this.drawerSize(),
      modal: this.modal(),
      closable: this.closable(),
      closeOnEscape: this.closeOnEscape(),
      dismissableMask: this.dismissableMask(),
      blockScroll: this.blockScroll(),
      draggable: this.draggable(),
      maximizable: this.maximizable(),
      autoFocus: this.autoFocus(),
      restoreFocus: this.restoreFocus(),
      role: this.role(),
      ariaLabel: this.ariaLabel(),
      panelClass: this.panelClass(),
      canClose: guard ? () => guard() : undefined,
      dt: this.dt(),
      unstyled: this.unstyled(),
    });
    this.current.set(ref);
    this.opened.emit();
    ref.closed.subscribe(() => {
      this.current.set(null);
      if (!this.destroyed) {
        this.visible.set(false);
        this.closed.emit();
      }
    });
  }
}
