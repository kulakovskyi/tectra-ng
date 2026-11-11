import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-unstyled-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart
    [items]="items"
    [ranges]="[40, 70]"
    [max]="100"
    unstyled
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartUnstyledExample {
  readonly items: TxBulletItem[] = [
    { label: 'A', value: 55, target: 65 },
    { label: 'B', value: 80, target: 70 },
  ];
}
