import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSunburstChart, TxSunburstItem } from '@tectra-ng/charts/sunburst';

@Component({
  selector: 'sunburst-chart-unstyled-example',
  imports: [TxSunburstChart],
  template: `<tx-sunburst-chart
    [data]="data"
    unstyled
    [height]="280"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-sunburst-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SunburstChartUnstyledExample {
  readonly data: TxSunburstItem[] = [
    {
      label: 'A',
      children: [
        { label: 'A1', value: 3 },
        { label: 'A2', value: 2 },
      ],
    },
    { label: 'B', value: 4 },
  ];
}
