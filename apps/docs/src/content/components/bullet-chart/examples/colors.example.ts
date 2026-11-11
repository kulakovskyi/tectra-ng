import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-colors-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart
    [items]="items"
    [ranges]="[50, 75]"
    [max]="100"
    ariaLabel="Service levels"
  />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartColorsExample {
  readonly items: TxBulletItem[] = [
    { label: 'Uptime', value: 96, target: 99, color: 'var(--tx-green-500)' },
    { label: 'Latency', value: 72, target: 80, color: 'var(--tx-orange-400)' },
    { label: 'Errors', value: 38, target: 60, color: 'var(--tx-red-500)' },
  ];
}
