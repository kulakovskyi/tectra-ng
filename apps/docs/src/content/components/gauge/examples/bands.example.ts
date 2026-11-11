import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge, TxGaugeBand } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-bands-example',
  imports: [TxGauge],
  template: `<tx-gauge
    [value]="640"
    [max]="1000"
    [bands]="bands"
    label="Response time, ms"
    ariaLabel="API"
  />`,
  styles: `
    tx-gauge {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeBandsExample {
  readonly bands: TxGaugeBand[] = [
    { from: 0, to: 300, tone: 'success', label: 'Fast' },
    { from: 300, to: 700, tone: 'warn', label: 'Slow' },
    { from: 700, to: 1000, tone: 'danger', label: 'Too slow' },
  ];
}
