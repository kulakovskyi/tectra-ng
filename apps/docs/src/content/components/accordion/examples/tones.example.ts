import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAccordion, TxAccordionItem, TxAccordionValue } from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-tones-example',
  imports: [TxAccordion],
  template: `<tx-accordion [items]="checks" [(value)]="open" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionTonesExample {
  readonly checks: TxAccordionItem[] = [
    { header: 'DNS records', content: 'All records point to the right servers.', tone: 'success' },
    { header: 'Certificate', content: 'Expires in 12 days — renew it soon.', tone: 'warn' },
    {
      header: 'Redirects',
      content: 'Two rules point to pages that no longer exist.',
      tone: 'danger',
    },
    { header: 'Caching', content: 'Static files are cached for one week.', tone: 'info' },
  ];
  readonly open = signal<TxAccordionValue>([]);
}
