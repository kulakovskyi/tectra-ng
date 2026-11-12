import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
} from '@angular/core';
import { optionalNumber } from '@tectra-ng/core/utils';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_TABLE, TxTableRowActionsSource } from './table.context';
import { TxTableAction } from './table.templates';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABLE_ICON_DEFAULTS } from './table.icons';

@Component({
  selector: 'tx-table-actions',
  imports: [NgTemplateOutlet, TxButton, TxPopover, TxPopoverTrigger, TxTooltip],
  template: `
    @for (action of inlineActions(); track action.id()) {
      <ng-container [ngTemplateOutlet]="action.templateRef" />
    }
    @if (overflowActions().length) {
      <button
        txButton
        type="button"
        size="small"
        icon="ellipsis-h"
        class="tx-table-actions__more"
        [txTooltip]="translations().moreActions"
        [attr.aria-label]="translations().moreActions"
        [txPopoverTrigger]="overflow"
      ></button>
      <tx-popover #overflow placement="bottom-end">
        <div class="tx-table-actions__overflow">
          @for (action of overflowActions(); track action.id()) {
            <ng-container [ngTemplateOutlet]="action.templateRef" />
          }
        </div>
      </tx-popover>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--tx-table-actions-gap, 7px);
    }

    .tx-table-actions__overflow {
      display: flex;
      flex-wrap: wrap;
      gap: var(--tx-table-actions-gap, 7px);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-table-actions' },
  viewProviders: [provideTxIconDefaults(TABLE_ICON_DEFAULTS)],
})
export class TxTableActions implements TxTableRowActionsSource {
  private table = inject(TX_TABLE, { optional: true });
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private row: Element | null = null;

  readonly inlineCount = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

  readonly actions = contentChildren(TxTableAction, { descendants: true });
  readonly translations = injectTranslations();

  private readonly present = computed(() => this.actions().filter((action) => !!action.id()));
  private readonly ordered = computed(() => {
    const present = this.present();
    const byId = new Map(present.map((action) => [action.id(), action]));
    const result: TxTableAction[] = [];
    (this.table?.actionsStore.order() ?? []).forEach((id) => {
      const action = byId.get(id);
      if (action) {
        result.push(action);
        byId.delete(id);
      }
    });
    present.forEach((action) => byId.has(action.id()) && result.push(action));
    return result;
  });

  readonly menuActions = computed<readonly TxTableAction[]>(() => this.ordered());
  private readonly showAll = computed(() => this.table?.cardView() ?? false);
  private readonly isInline = (action: TxTableAction, index: number) => {
    const own = this.inlineCount();
    if (own !== undefined && !this.table?.actionsStore.pinned()) return index < own;
    return this.table ? this.table.actionsStore.isPinned(action.id()) : index < (own ?? 0);
  };

  readonly inlineActions = computed(() => (this.showAll() ? this.ordered() : this.ordered().filter((action, index) => this.isInline(action, index))));
  readonly overflowActions = computed(() => (this.showAll() ? [] : this.ordered().filter((action, index) => !this.isInline(action, index))));

  constructor() {
    effect(() => {
      const items = this.present().map((action) => ({ id: action.id(), label: action.label() }));
      this.table?.actionsStore.register(items);
    });
    afterNextRender(() => {
      this.row = this.host.nativeElement.closest('tr, .tx-table__card');
      if (this.row) this.table?.registerRowActions(this.row, this);
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.row) this.table?.unregisterRowActions(this.row, this);
    });
  }
}
