import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxGauge } from '@tectra-ng/charts/gauge';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'gauge-loading-and-empty-example',
  imports: [TxGauge, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="value.set(null)"></button>
      </div>
      <tx-gauge [value]="value()" [loading]="loading()" label="Uptime" valueFormat="percent" />
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
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeLoadingAndEmptyExample {
  readonly value = signal<number | null>(null);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.value.set(99.2);
      this.loading.set(false);
    }, 900);
  }
}
