import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge, TxGaugeBand } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-accessibility-example',
  imports: [TxGauge],
  template: `<tx-gauge
    [value]="83"
    [bands]="bands"
    label="Error budget used"
    valueFormat="percent"
    ariaLabel="Checkout service"
  />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeAccessibilityExample {
  readonly bands: TxGaugeBand[] = [
    { from: 0, to: 50, tone: 'success', label: 'Healthy' },
    { from: 50, to: 80, tone: 'warn', label: 'At risk' },
    { from: 80, to: 100, tone: 'danger', label: 'Exhausted' },
  ];
}
