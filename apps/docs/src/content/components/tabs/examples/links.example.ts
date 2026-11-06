import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxTab, TxTabList, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-links-example',
  imports: [TxTabs, TxTabList, TxTab, RouterLink],
  template: `
    <tx-tabs variant="line" [(value)]="active">
      <tx-tab-list ariaLabel="Sections">
        @for (section of sections; track section) {
          <a
            txTab
            [value]="section"
            [routerLink]="[]"
            [queryParams]="{ section: section }"
            queryParamsHandling="merge"
            >{{ section }}</a
          >
        }
      </tx-tab-list>
    </tx-tabs>
    <p class="status">Opened section: {{ active() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsLinksExample {
  readonly sections = ['Domains', 'Records', 'Certificates'];
  readonly active = signal<TxTabValue | undefined>('Domains');
}
