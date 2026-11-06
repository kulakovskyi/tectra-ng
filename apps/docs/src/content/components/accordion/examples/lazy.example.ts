import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxAccordion,
  TxAccordionContent,
  TxAccordionContentTemplate,
  TxAccordionHeader,
  TxAccordionPanel,
  TxAccordionValue,
} from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-lazy-example',
  imports: [
    TxAccordion,
    TxAccordionPanel,
    TxAccordionHeader,
    TxAccordionContent,
    TxAccordionContentTemplate,
  ],
  template: `
    <tx-accordion [(value)]="open">
      @for (report of reports; track report) {
        <tx-accordion-panel [value]="report">
          <tx-accordion-header>{{ report }} report</tx-accordion-header>
          <tx-accordion-content>
            <ng-template txAccordionContent>Loaded at {{ loadedAt() }}.</ng-template>
          </tx-accordion-content>
        </tx-accordion-panel>
      }
    </tx-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionLazyExample {
  readonly reports = ['Traffic', 'Errors', 'Billing'];
  readonly open = signal<TxAccordionValue>([]);

  loadedAt(): string {
    return new Date().toLocaleTimeString();
  }
}
