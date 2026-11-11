import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-forecast-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="weeks"
    xType="time"
    valueFormat="compact"
    ariaLabel="Orders and the forecast with its range"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartForecastExample {
  readonly weeks = Array.from({ length: 16 }, (_, index) => new Date(2026, 8, 7 + index * 7));
  readonly series: TxRangeSeries[] = [
    {
      name: 'Forecast',
      low: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        4100,
        4000,
        3950,
        3900,
        3850,
        3800,
        3700,
        3650,
      ],
      high: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        4500,
        4650,
        4800,
        4950,
        5100,
        5250,
        5400,
        5550,
      ],
      line: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        4250,
        4300,
        4330,
        4380,
        4420,
        4470,
        4520,
        4560,
        4600,
      ],
    },
    {
      name: 'Actual',
      low: [3400, 3550, 3500, 3700, 3820, 3900, 4050, 4250],
      high: [3400, 3550, 3500, 3700, 3820, 3900, 4050, 4250],
      line: [3400, 3550, 3500, 3700, 3820, 3900, 4050, 4250],
    },
  ];
}
