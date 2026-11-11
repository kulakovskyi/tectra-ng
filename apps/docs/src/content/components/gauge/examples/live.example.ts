import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxGauge, TxGaugeBand } from '@tectra-ng/charts/gauge';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'gauge-live-example',
  imports: [TxGauge, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="New reading" variant="outlined" (click)="next()"></button>
      </div>
      <div class="row">
        <tx-gauge
          [value]="value()"
          tone="info"
          label="Humidity"
          valueFormat="percent"
          [height]="200"
        />
        <tx-gauge
          [value]="value()"
          [bands]="bands"
          label="Humidity"
          valueFormat="percent"
          [height]="200"
        />
      </div>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .controls {
      display: flex;
      gap: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeLiveExample {
  private step = 0;
  readonly value = signal(46);
  readonly bands: TxGaugeBand[] = [
    { from: 0, to: 30, tone: 'warn', label: 'Dry' },
    { from: 30, to: 60, tone: 'success', label: 'Comfortable' },
    { from: 60, to: 100, tone: 'info', label: 'Humid' },
  ];

  next(): void {
    this.step += 1;
    this.value.set(12 + ((this.step * 37) % 81));
  }
}
