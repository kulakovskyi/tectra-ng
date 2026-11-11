import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-basic-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart
    [items]="items"
    [ranges]="[60, 85]"
    [max]="100"
    valueFormat="percent"
    ariaLabel="Quarter goals"
  />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartBasicExample {
  readonly items: TxBulletItem[] = [
    { label: 'Revenue', value: 78, target: 90 },
    { label: 'New clients', value: 64, target: 70 },
    { label: 'Retention', value: 93, target: 88 },
    { label: 'NPS', value: 51, target: 75 },
  ];
}
