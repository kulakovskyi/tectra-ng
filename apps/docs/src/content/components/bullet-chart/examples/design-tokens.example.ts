import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-design-tokens-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart
    [items]="items"
    [ranges]="[30, 60]"
    [max]="100"
    [dt]="{
      bullet: {
        rowHeight: '56',
        barHeight: '0.22',
        barColor: 'var(--tx-purple-500)',
        targetColor: 'var(--tx-red-500)',
        targetWidth: '3',
      },
    }"
    ariaLabel="Survey scores"
  />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartDesignTokensExample {
  readonly items: TxBulletItem[] = [
    { label: 'Clarity', value: 74, target: 80 },
    { label: 'Speed', value: 58, target: 65 },
  ];
}
