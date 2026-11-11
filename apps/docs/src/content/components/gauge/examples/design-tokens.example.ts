import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-design-tokens-example',
  imports: [TxGauge],
  template: `<tx-gauge
    [value]="58"
    label="Focus score"
    [dt]="{
      gauge: { thickness: '0.28', primaryColor: 'var(--tx-green-500)', valueFontWeight: '700' },
    }"
  />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeDesignTokensExample {}
