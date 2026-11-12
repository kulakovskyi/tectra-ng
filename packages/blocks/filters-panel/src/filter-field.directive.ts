import { Directive, ElementRef, InjectionToken, Signal, booleanAttribute, computed, inject, input } from '@angular/core';
import { TxFluid } from '@tectra-ng/core/fluid';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { FILTERS_PANEL_ICON_DEFAULTS } from './filters-panel.icons';

export interface TxFiltersPanelContext {
  isFieldHidden(key: string): boolean;
  fieldOrder(key: string): number | null;
}

export const TX_FILTERS_PANEL = new InjectionToken<TxFiltersPanelContext>('TX_FILTERS_PANEL');

@Directive({
  selector: '[txFilterField]',
  providers: [provideTxIconDefaults(FILTERS_PANEL_ICON_DEFAULTS), { provide: TxFluid, useFactory: () => new TxFluid() }],
  host: {
    class: 'tx-filter-field',
    '[attr.hidden]': 'hidden() ? "" : null',
    '[style.display]': 'hidden() ? "none" : null',
    '[style.order]': 'order()',
  },
})
export class TxFilterField {
  private readonly panel = inject(TX_FILTERS_PANEL, { optional: true });

  readonly txFilterField = input.required<string>();
  readonly filterLabel = input.required<string>();
  readonly filterActive = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly hidden: Signal<boolean> = computed(() => this.panel?.isFieldHidden(this.txFilterField()) ?? false);
  readonly order: Signal<number | null> = computed(() => this.panel?.fieldOrder(this.txFilterField()) ?? null);
}

@Directive({
  selector: '[txFiltersReset]',
  host: { class: 'tx-filters-panel__reset' },
  providers: [provideTxIconDefaults(FILTERS_PANEL_ICON_DEFAULTS)],
})
export class TxFiltersReset {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  trigger(): void {
    this.host.nativeElement.click();
  }
}
