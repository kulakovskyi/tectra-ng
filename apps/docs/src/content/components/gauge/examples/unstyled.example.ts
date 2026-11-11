import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-unstyled-example',
  imports: [TxGauge],
  template: `<tx-gauge [value]="40" unstyled [height]="200" label="Unstyled" />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeUnstyledExample {}
