import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxAccordion,
  TxAccordionItem,
  TxAccordionToggleEvent,
  TxAccordionValue,
} from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-items-example',
  imports: [TxAccordion],
  template: `
    <tx-accordion
      [items]="items"
      [(value)]="open"
      (opened)="log('Opened', $event)"
      (closed)="log('Closed', $event)"
    />
    <p class="status">{{ last() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionItemsExample {
  readonly items: TxAccordionItem[] = [
    { header: 'Shipping', content: 'Orders leave the warehouse within two working days.' },
    { header: 'Returns', content: 'Return any item within 30 days for a full refund.' },
    { header: 'Warranty', content: 'Two years on every device, one year on accessories.' },
  ];
  readonly open = signal<TxAccordionValue>([]);
  readonly last = signal('Open a section');

  log(action: string, event: TxAccordionToggleEvent): void {
    this.last.set(`${action}: ${event.item?.header} (index ${event.index})`);
  }
}
