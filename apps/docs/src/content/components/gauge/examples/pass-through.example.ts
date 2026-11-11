import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge, TxGaugeBand } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-pass-through-example',
  imports: [TxGauge],
  template: `<tx-gauge
    [value]="3.4"
    [max]="5"
    [bands]="bands"
    label="Load average"
    [pt]="{
      band: { style: { opacity: '0.55' } },
      value: { style: { 'letter-spacing': '0.04em' } },
    }"
  />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugePassThroughExample {
  readonly bands: TxGaugeBand[] = [
    { from: 0, to: 2, tone: 'success' },
    { from: 2, to: 4, tone: 'warn' },
    { from: 4, to: 5, tone: 'danger' },
  ];
}
