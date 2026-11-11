import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-accessibility-example',
  imports: [TxBulletChart],
  template: `<tx-bullet-chart
    [items]="items"
    [ranges]="[40, 70]"
    [max]="100"
    ariaLabel="Team goals"
  />`,
  styles: `
    tx-bullet-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartAccessibilityExample {
  readonly items: TxBulletItem[] = [
    { label: 'Velocity', value: 62, target: 70 },
    { label: 'Quality', value: 81, target: 75 },
  ];
}
