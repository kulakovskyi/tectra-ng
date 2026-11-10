import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

function signal(count: number): number[] {
  let value = 50;
  return Array.from({ length: count }, (_, index) => {
    value +=
      Math.sin(index / 37) * 0.9 + Math.cos(index / 211) * 0.6 + ((index * 7919) % 13) / 13 - 0.5;
    return Math.round(value * 10) / 10;
  });
}

@Component({
  selector: 'line-chart-large-data-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    [categories]="labels"
    [area]="false"
    [height]="300"
    ariaLabel="Sensor readings, 20 000 points"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartLargeDataExample {
  readonly labels = Array.from({ length: 20000 }, (_, index) => `#${index + 1}`);
  readonly series: TxChartSeries[] = [{ name: 'Reading', data: signal(20000) }];
}
