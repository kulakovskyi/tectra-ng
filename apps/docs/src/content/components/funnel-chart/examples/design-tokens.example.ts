import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-design-tokens-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart
    [items]="items"
    [dt]="{
      funnel: { rowGap: '0.12', radius: '2px', connectorOpacity: '0.3' },
      series: { color1: 'var(--tx-green-500)' },
    }"
    ariaLabel="Course progress"
  />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartDesignTokensExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Enrolled', value: 900 },
    { label: 'Started', value: 720 },
    { label: 'Halfway', value: 410 },
    { label: 'Finished', value: 260 },
  ];
}
