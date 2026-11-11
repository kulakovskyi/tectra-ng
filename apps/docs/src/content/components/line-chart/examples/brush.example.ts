import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

function traffic(days: number): number[] {
  return Array.from({ length: days }, (_, index) =>
    Math.round(1200 + Math.sin(index / 5) * 260 + Math.cos(index / 2.3) * 90 + index * 6),
  );
}

@Component({
  selector: 'line-chart-brush-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    [categories]="days"
    xType="time"
    brush
    [xRange]="start"
    [height]="380"
    ariaLabel="Daily visits with an overview"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartBrushExample {
  readonly days = Array.from({ length: 180 }, (_, index) => new Date(2026, 4, 1 + index));
  readonly series: TxChartSeries[] = [{ name: 'Visits', data: traffic(180) }];
  readonly start: [number, number] = [
    new Date(2026, 8, 1).getTime(),
    new Date(2026, 9, 1).getTime(),
  ];
}
