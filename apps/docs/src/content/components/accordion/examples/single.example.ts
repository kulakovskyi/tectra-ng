import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAccordion, TxAccordionItem, TxAccordionValue } from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-single-example',
  imports: [TxAccordion],
  template: `
    <tx-accordion [multiple]="false" [items]="steps" [(value)]="open" />
    <p class="status">Open: {{ open() ?? 'none' }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionSingleExample {
  readonly steps: TxAccordionItem[] = [
    { value: 'account', header: 'Create an account', content: 'Sign up with your work email.' },
    {
      value: 'team',
      header: 'Invite the team',
      content: 'Add people by email; they get a link to join.',
    },
    {
      value: 'project',
      header: 'Start a project',
      content: 'Pick a template or start from an empty project.',
    },
  ];
  readonly open = signal<TxAccordionValue>('account');
}
