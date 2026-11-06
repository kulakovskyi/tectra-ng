import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  Injector,
  TemplateRef,
  WritableSignal,
  booleanAttribute,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraDialogTokens } from '@tectra-ng/themes';
import {
  TX_DIALOG_CURRENT,
  TxDialogAutoFocus,
  TxDialogContent,
  TxDialogFooter,
  TxDialogHeader,
  TxDialogRef,
  TxDialogService,
  TxDialogTemplateContext,
  TxDrawerPosition,
  TxDrawerSize,
} from '@tectra-ng/ui/dialog';

@Directive({ selector: '[txDrawerHeader]' })
export class TxDrawerHeader {}

@Directive({ selector: '[txDrawerFooter]' })
export class TxDrawerFooter {}

@Component({
  selector: 'tx-drawer',
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter],
  template: `
    <ng-template #body>
      @if (header() || headerSlot()) {
        <tx-dialog-header [title]="header()" [closeButton]="closable()">
          <ng-content select="[txDrawerHeader]" />
        </tx-dialog-header>
      }
      <tx-dialog-content>
        <ng-content />
      </tx-dialog-content>
      @if (footerSlot()) {
        <tx-dialog-footer>
          <ng-content select="[txDrawerFooter]" />
        </tx-dialog-footer>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_DIALOG_CURRENT, useFactory: () => signal<TxDialogRef | null>(null) }],
  host: { class: 'tx-drawer-host', style: 'display: contents' },
})
export class TxDrawer {
  private dialogs = inject(TxDialogService);
  private injector = inject(Injector);
  private current = inject(TX_DIALOG_CURRENT) as WritableSignal<TxDialogRef | null>;
  private destroyed = false;

  readonly visible = model(false);
  readonly header = input<string | undefined>(undefined);
  readonly position = input<TxDrawerPosition>('right');
  readonly size = input<TxDrawerSize | (string & {})>('medium');
  readonly modal = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly closable = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly dismissable = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly closeOnEscape = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly blockScroll = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly autoFocus = input<TxDialogAutoFocus>('first');
  readonly restoreFocus = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly panelClass = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraDialogTokens> | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly headerSlot = contentChild(TxDrawerHeader);
  readonly footerSlot = contentChild(TxDrawerFooter);
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
    const ref = this.dialogs.open(this.body(), {
      injector: this.injector,
      drawer: this.position(),
      drawerSize: this.size(),
      modal: this.modal(),
      closable: this.closable(),
      dismissableMask: this.dismissable(),
      closeOnEscape: this.closeOnEscape(),
      blockScroll: this.blockScroll(),
      autoFocus: this.autoFocus(),
      restoreFocus: this.restoreFocus(),
      ariaLabel: this.ariaLabel(),
      panelClass: this.panelClass(),
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
