import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-format-and-scale-example',
  imports: [TxGauge],
  template: `<tx-gauge
    [value]="18400"
    [min]="5000"
    [max]="25000"
    [ticks]="4"
    valueFormat="compact"
    label="Monthly visitors"
  />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeFormatAndScaleExample {}
