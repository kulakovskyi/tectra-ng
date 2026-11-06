import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAccordion, TxAccordionItem, TxAccordionValue } from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-keyboard-example',
  imports: [TxAccordion],
  template: `<tx-accordion
    [multiple]="false"
    [selectOnFocus]="true"
    [items]="items"
    [(value)]="open"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionKeyboardExample {
  readonly items: TxAccordionItem[] = [
    { header: 'Monday', content: 'Planning, 10:00.' },
    { header: 'Wednesday', content: 'Design review, 14:00.' },
    { header: 'Friday', content: 'Demo, 16:00.' },
  ];
  readonly open = signal<TxAccordionValue>(0);
}
