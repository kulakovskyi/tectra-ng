import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxAccordion,
  TxAccordionContent,
  TxAccordionHeader,
  TxAccordionPanel,
  TxAccordionValue,
} from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-basic-example',
  imports: [TxAccordion, TxAccordionPanel, TxAccordionHeader, TxAccordionContent],
  template: `
    <tx-accordion [(value)]="open">
      <tx-accordion-panel value="dns">
        <tx-accordion-header>How long does a DNS change take?</tx-accordion-header>
        <tx-accordion-content
          >Most resolvers pick up a change within an hour; some keep the old record up to two
          days.</tx-accordion-content
        >
      </tx-accordion-panel>
      <tx-accordion-panel value="ssl">
        <tx-accordion-header>When is the certificate renewed?</tx-accordion-header>
        <tx-accordion-content
          >Thirty days before it expires. You get an email if the renewal
          fails.</tx-accordion-content
        >
      </tx-accordion-panel>
      <tx-accordion-panel value="transfer">
        <tx-accordion-header>Can I move a domain to another account?</tx-accordion-header>
        <tx-accordion-content
          >Yes — start a transfer from the domain settings and confirm it from the other
          account.</tx-accordion-content
        >
      </tx-accordion-panel>
    </tx-accordion>
    <p class="status">Open: {{ openText() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionBasicExample {
  readonly open = signal<TxAccordionValue>(['dns']);

  openText(): string {
    const open = this.open();
    return Array.isArray(open) && open.length ? open.join(', ') : 'none';
  }
}
