import { Directive, ElementRef, InjectionToken, Signal, booleanAttribute, computed, inject, input } from '@angular/core';
import { TxFluid } from '@tectra-ng/core/fluid';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { FILTERS_PANEL_ICON_DEFAULTS } from './filters-panel.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { FILTERS_PANEL_THEME } from './filters-panel.theme';

/** What a `txFilterField` asks its panel: whether it is hidden and where it sits. */
export interface TxFiltersPanelContext {
  /** Tells whether the field with this key is hidden. */
  isFieldHidden(key: string): boolean;
  /** Position of the field with this key, or `null` when the order is not customised. */
  fieldOrder(key: string): number | null;
}

/** Injection token through which `txFilterField` finds its `tx-filters-panel`. */
export const TX_FILTERS_PANEL = new InjectionToken<TxFiltersPanelContext>('TX_FILTERS_PANEL');

/** Marks a field inside `tx-filters-panel` so the user can show, hide and reorder it. */
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
  private readonly filtersPanelTheme = injectTokens(FILTERS_PANEL_THEME);

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
  private readonly filtersPanelTheme = injectTokens(FILTERS_PANEL_THEME);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  trigger(): void {
    this.host.nativeElement.click();
  }
}
