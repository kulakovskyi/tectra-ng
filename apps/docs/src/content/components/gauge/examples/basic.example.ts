import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-basic-example',
  imports: [TxGauge],
  template: `<tx-gauge [value]="72" label="CPU load" valueFormat="percent" ariaLabel="Server" />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeBasicExample {}
