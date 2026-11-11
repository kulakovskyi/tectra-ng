import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSunburstChart, TxSunburstItem } from '@tectra-ng/charts/sunburst';

@Component({
  selector: 'sunburst-chart-accessibility-example',
  imports: [TxSunburstChart],
  template: `<tx-sunburst-chart [data]="data" totalLabel="GB used" ariaLabel="Disk usage" />`,
  styles: `
    tx-sunburst-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SunburstChartAccessibilityExample {
  readonly data: TxSunburstItem[] = [
    {
      label: 'Photos',
      children: [
        {
          label: '2024',
          children: [
            { label: 'Trips', value: 18 },
            { label: 'Family', value: 11 },
            { label: 'Other', value: 4 },
          ],
        },
        {
          label: '2025',
          children: [
            { label: 'Trips', value: 22 },
            { label: 'Family', value: 9 },
          ],
        },
        { label: '2026', value: 14 },
      ],
    },
    {
      label: 'Work',
      children: [
        {
          label: 'Projects',
          children: [
            { label: 'Design', value: 12 },
            { label: 'Code', value: 7 },
            { label: 'Video', value: 16 },
          ],
        },
        { label: 'Archive', value: 9 },
      ],
    },
    {
      label: 'Music',
      children: [
        { label: 'Albums', value: 13 },
        { label: 'Podcasts', value: 5 },
      ],
    },
    { label: 'Apps', value: 10 },
  ];
}
