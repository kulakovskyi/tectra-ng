import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';

@Component({
  selector: 'gauge-tones-example',
  imports: [TxGauge],
  template: `
    <div class="row">
      <tx-gauge [value]="38" tone="success" label="Disk" valueFormat="percent" [height]="180" />
      <tx-gauge [value]="71" tone="warn" label="Memory" valueFormat="percent" [height]="180" />
      <tx-gauge [value]="94" tone="danger" label="Swap" valueFormat="percent" [height]="180" />
      <tx-gauge
        [value]="56"
        color="var(--tx-purple-500)"
        label="Queue"
        valueFormat="percent"
        [height]="180"
      />
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeTonesExample {}
