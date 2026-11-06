import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxAccordion,
  TxAccordionContent,
  TxAccordionHeader,
  TxAccordionPanel,
  TxAccordionValue,
} from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-disabled-example',
  imports: [TxAccordion, TxAccordionPanel, TxAccordionHeader, TxAccordionContent],
  template: `
    <tx-accordion [(value)]="open">
      <tx-accordion-panel value="plan">
        <tx-accordion-header>Plan</tx-accordion-header>
        <tx-accordion-content>Team plan, billed yearly.</tx-accordion-content>
      </tx-accordion-panel>
      <tx-accordion-panel value="sso" [disabled]="true">
        <tx-accordion-header>Single sign-on (Enterprise plan)</tx-accordion-header>
        <tx-accordion-content>Connect your identity provider.</tx-accordion-content>
      </tx-accordion-panel>
      <tx-accordion-panel value="audit">
        <tx-accordion-header>Audit log</tx-accordion-header>
        <tx-accordion-content>Every change in the last 90 days.</tx-accordion-content>
      </tx-accordion-panel>
    </tx-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionDisabledExample {
  readonly open = signal<TxAccordionValue>([]);
}
