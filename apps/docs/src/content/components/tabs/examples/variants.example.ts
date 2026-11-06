import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-variants-example',
  imports: [TxTabs],
  template: `
    <div class="column">
      <tx-tabs variant="segmented" [tabs]="tabs" [(value)]="segmented" />
      <tx-tabs variant="pills" [tabs]="tabs" [(value)]="pills" />
      <tx-tabs variant="line" [tabs]="tabs" [(value)]="line" />
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
export default class TabsVariantsExample {
  readonly tabs: TxTabItem[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];
  readonly segmented = signal<TxTabValue | undefined>('week');
  readonly pills = signal<TxTabValue | undefined>('week');
  readonly line = signal<TxTabValue | undefined>('week');
}
