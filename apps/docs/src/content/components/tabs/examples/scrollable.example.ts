import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-scrollable-example',
  imports: [TxTabs],
  template: `
    <div class="column">
      <tx-tabs class="tabs" variant="line" [scrollable]="true" [tabs]="tabs" [(value)]="line" />
      <tx-tabs class="tabs" variant="pills" [scrollable]="true" [tabs]="tabs" [(value)]="pills" />
    </div>
  `,
  styles: `
    .column {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .tabs {
      width: 100%;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsScrollableExample {
  readonly tabs: TxTabItem[] = Array.from({ length: 15 }, (_, index) => ({
    value: `report-${index + 1}`,
    label: `Report ${index + 1}`,
  }));
  readonly line = signal<TxTabValue | undefined>('report-12');
  readonly pills = signal<TxTabValue | undefined>('report-3');
}
