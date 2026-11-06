import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxAccordion,
  TxAccordionContentTemplate,
  TxAccordionHeaderTemplate,
  TxAccordionItem,
  TxAccordionValue,
} from '@tectra-ng/ui/accordion';
import { TxPill } from '@tectra-ng/ui/pill';

interface ServerItem extends TxAccordionItem {
  region: string;
  status: 'Running' | 'Stopped';
  cpu: string;
}

@Component({
  selector: 'accordion-templates-example',
  imports: [TxAccordion, TxAccordionHeaderTemplate, TxAccordionContentTemplate, TxPill],
  template: `
    <tx-accordion [items]="servers" [(value)]="open">
      <ng-template txAccordionHeader let-item>
        <span class="head">
          {{ item.header }}
          <tx-pill [tone]="item['status'] === 'Running' ? 'success' : 'neutral'">{{
            item['status']
          }}</tx-pill>
        </span>
      </ng-template>
      <ng-template txAccordionContent let-item>
        <dl class="facts">
          <dt>Region</dt>
          <dd>{{ item['region'] }}</dd>
          <dt>CPU</dt>
          <dd>{{ item['cpu'] }}</dd>
        </dl>
      </ng-template>
    </tx-accordion>
  `,
  styles: `
    .head {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .facts {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 4px 16px;
      margin: 0;
    }
    .facts dd {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccordionTemplatesExample {
  readonly servers: ServerItem[] = [
    { header: 'web-01', region: 'Frankfurt', status: 'Running', cpu: '2 vCPU' },
    { header: 'web-02', region: 'Amsterdam', status: 'Running', cpu: '4 vCPU' },
    { header: 'backup-01', region: 'Warsaw', status: 'Stopped', cpu: '1 vCPU' },
  ];
  readonly open = signal<TxAccordionValue>([0]);
}
