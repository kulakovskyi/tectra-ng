import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAccordion, TxAccordionItem, TxAccordionValue } from '@tectra-ng/ui/accordion';
import { FAQ } from '../landing.data';

@Component({
  selector: 'docs-landing-faq',
  imports: [TxAccordion],
  template: `
    <section class="faq" aria-labelledby="faq-title">
      <div class="faq__frame">
        <div class="faq__intro">
          <span class="faq__label">FAQ</span>
          <h2 class="faq__title" id="faq-title">Good questions, straight answers.</h2>
        </div>
        <tx-accordion class="faq__list" [items]="items" [multiple]="false" [(value)]="open" />
      </div>
    </section>
  `,
  styleUrl: './faq.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFaq {
  readonly items: TxAccordionItem[] = FAQ;
  readonly open = signal<TxAccordionValue>(null);
}
