import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TX_ACCORDION, TX_ACCORDION_PANEL, TxAccordionPanelContext } from './accordion.context';
import { TxAccordionItem, TxAccordionPanelValue, TxAccordionTone } from './accordion.types';

@Component({
  selector: 'tx-accordion-panel',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_ACCORDION_PANEL, useExisting: TxAccordionPanel }],
  host: {
    class: 'tx-accordion-panel',
    '[class]': 'accordion.passThrough().panel?.class',
    '[style]': 'accordion.passThrough().panel?.style',
    '[class.tx-accordion-panel--active]': 'active()',
    '[class.tx-accordion-panel--disabled]': 'disabled()',
    '[attr.data-tone]': 'tone() ?? null',
    '[attr.data-value]': 'value()',
  },
})
export class TxAccordionPanel implements TxAccordionPanelContext {
  protected readonly accordion = inject(TX_ACCORDION);
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private id = uniqueId('tx-accordion');

  readonly value = input.required<TxAccordionPanelValue>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tone = input<TxAccordionTone | undefined>(undefined);
  readonly item = input<TxAccordionItem | undefined>(undefined);

  readonly headerId = `${this.id}-header`;
  readonly contentId = `${this.id}-content`;
  readonly active = computed(() => this.accordion.isActive(this.value()));

  toggle(): void {
    if (!this.disabled()) {
      this.accordion.toggle(this.value(), this.element, this.item());
    }
  }

  open(): void {
    if (!this.disabled()) {
      this.accordion.open(this.value(), this.element, this.item());
    }
  }
}
