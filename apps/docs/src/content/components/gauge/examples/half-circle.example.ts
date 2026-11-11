import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-half-circle-example',
  imports: [TxGauge],
  template: `
    <div class="row">
      <tx-gauge
        [value]="64"
        [startAngle]="-90"
        [endAngle]="90"
        tone="info"
        label="Battery"
        valueFormat="percent"
        [height]="180"
      />
      <tx-gauge
        [value]="64"
        [startAngle]="-90"
        [endAngle]="90"
        needle
        label="Volume"
        valueFormat="percent"
        [height]="180"
      />
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeHalfCircleExample {}
