import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAccordion, TxAccordionItem, TxAccordionValue } from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-design-tokens-example',
  imports: [TxAccordion],
  template: `
    <tx-accordion
      [items]="items"
      [(value)]="open"
      [dt]="{
        header: { padding: '18px', activeColor: 'var(--tx-primary-base)' },
        content: { background: 'var(--tx-surface-ground)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionDesignTokensExample {
  readonly items: TxAccordionItem[] = [
    { header: 'What is included?', content: 'Hosting, backups and email support.' },
    {
      header: 'Can I cancel any time?',
      content: 'Yes, the plan stays active until the end of the period.',
    },
  ];
  readonly open = signal<TxAccordionValue>([0]);
}
