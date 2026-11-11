import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSunburstChart, TxSunburstItem } from '@tectra-ng/charts/sunburst';

@Component({
  selector: 'sunburst-chart-colors-example',
  imports: [TxSunburstChart],
  template: `<tx-sunburst-chart [data]="data" [drill]="false" ariaLabel="Team by role" />`,
  styles: `
    tx-sunburst-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SunburstChartColorsExample {
  readonly data: TxSunburstItem[] = [
    {
      label: 'Engineering',
      color: 'var(--tx-primary-500)',
      children: [
        { label: 'Frontend', value: 14 },
        { label: 'Backend', value: 18 },
        { label: 'Mobile', value: 6 },
      ],
    },
    {
      label: 'Design',
      color: 'var(--tx-purple-500)',
      children: [
        { label: 'Product', value: 5 },
        { label: 'Brand', value: 2 },
      ],
    },
    {
      label: 'Sales',
      color: 'var(--tx-orange-400)',
      children: [
        { label: 'Direct', value: 9 },
        { label: 'Partners', value: 4 },
      ],
    },
  ];
}
