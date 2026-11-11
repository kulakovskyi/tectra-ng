import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-own-ranges-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart [items]="items" [max]="1000" ariaLabel="Response times, ms" />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartOwnRangesExample {
  readonly items: TxBulletItem[] = [
    { label: 'Search', value: 320, target: 400, ranges: [400, 700] },
    { label: 'Checkout', value: 610, target: 500, ranges: [300, 500] },
    { label: 'Profile', value: 180, target: 250, ranges: [250, 600, 900] },
  ];
}
