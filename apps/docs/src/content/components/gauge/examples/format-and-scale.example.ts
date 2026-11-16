import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartCurrencyFormat } from '@tectra-ng/charts/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-format-and-scale-example',
  imports: [TxGauge],
  template: `
    <div class="row">
      <tx-gauge
        [value]="18400"
        [min]="5000"
        [max]="25000"
        [ticks]="4"
        valueFormat="compact"
        label="Monthly visitors"
      />
      <tx-gauge [value]="186400" [max]="250000" [valueFormat]="usd" label="Quarter revenue" />
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeFormatAndScaleExample {
  readonly usd: TxChartCurrencyFormat = { currency: 'USD' };
}
