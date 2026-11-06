import { ChangeDetectionStrategy, Component, computed, contentChild, inject, linkedSignal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TX_ACCORDION, TX_ACCORDION_PANEL } from './accordion.context';
import { TxAccordionContentTemplate } from './accordion.templates';

@Component({
  selector: 'tx-accordion-content',
  imports: [NgTemplateOutlet],
  template: `
    <div class="tx-accordion-content__wrapper">
      <div class="tx-accordion-content__inner" [class]="accordion.passThrough().contentInner?.class" [style]="accordion.passThrough().contentInner?.style">
        <ng-content />
        @if (lazyContent(); as content) {
          @if (rendered()) {
            <ng-container *ngTemplateOutlet="content.template; context: templateContext()" />
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-accordion-content',
    role: 'region',
    '[class]': 'accordion.passThrough().content?.class',
    '[style]': 'accordion.passThrough().content?.style',
    '[id]': 'panel.contentId',
    '[attr.aria-labelledby]': 'panel.headerId',
    '[attr.inert]': 'panel.active() ? null : ""',
  },
})
export class TxAccordionContent {
  protected readonly accordion = inject(TX_ACCORDION);
  protected readonly panel = inject(TX_ACCORDION_PANEL);

  protected readonly lazyContent = contentChild(TxAccordionContentTemplate);
  protected readonly rendered = linkedSignal<boolean, boolean>({
    source: () => this.panel.active(),
    computation: (active, previous) => active || (previous?.value ?? false),
  });
  protected readonly templateContext = computed(() => {
    const item = this.panel.item() ?? { header: '' };
    return { $implicit: item, item, index: -1, active: this.panel.active() };
  });
}
