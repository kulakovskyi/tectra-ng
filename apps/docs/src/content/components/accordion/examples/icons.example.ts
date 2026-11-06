import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import {
  TxAccordion,
  TxAccordionItem,
  TxAccordionToggleIconTemplate,
  TxAccordionValue,
} from '@tectra-ng/ui/accordion';

@Component({
  selector: 'accordion-icons-example',
  imports: [TxAccordion, TxAccordionToggleIconTemplate, TxIcon],
  template: `
    <div class="column">
      <tx-accordion expandIcon="plus" collapseIcon="minus" [items]="items" [(value)]="first" />
      <tx-accordion [items]="items" [(value)]="second">
        <ng-template txAccordionToggleIcon let-active>
          <tx-icon [name]="active ? 'eye' : 'eye-slash'" />
        </ng-template>
      </tx-accordion>
    </div>
  `,
  styles: `
    .column {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionIconsExample {
  readonly items: TxAccordionItem[] = [
    { header: 'Public profile', content: 'Visible to everyone with the link.' },
    { header: 'Contact details', content: 'Visible to your team only.' },
  ];
  readonly first = signal<TxAccordionValue>([]);
  readonly second = signal<TxAccordionValue>([]);
}
