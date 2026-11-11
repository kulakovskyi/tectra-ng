import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-pass-through-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart
    [items]="items"
    [ranges]="[50, 80]"
    [max]="100"
    [pt]="{ target: { style: { 'stroke-dasharray': '2 2' } } }"
    ariaLabel="Plan versus fact"
  />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartPassThroughExample {
  readonly items: TxBulletItem[] = [
    { label: 'Plan A', value: 66, target: 75 },
    { label: 'Plan B', value: 88, target: 80 },
  ];
}
