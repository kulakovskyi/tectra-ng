import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'scatter-chart-loading-and-empty-example',
  imports: [TxScatterChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="series.set([])"></button>
      </div>
      <tx-scatter-chart
        [series]="series()"
        [loading]="loading()"
        [height]="260"
        ariaLabel="Load and latency"
      />
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
export default class ScatterChartLoadingAndEmptyExample {
  readonly series = signal<TxScatterSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.series.set([
        {
          name: 'Latency',
          data: [
            [10, 42],
            [20, 48],
            [40, 61],
            [60, 70],
            [80, 96],
          ],
        },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
