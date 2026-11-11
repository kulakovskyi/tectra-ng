import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'radar-chart-loading-and-empty-example',
  imports: [TxRadarChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="series.set([])"></button>
      </div>
      <tx-radar-chart
        [series]="series()"
        [categories]="axes"
        [loading]="loading()"
        [height]="280"
        ariaLabel="Service health"
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
export default class RadarChartLoadingAndEmptyExample {
  readonly axes = ['Latency', 'Errors', 'Saturation', 'Traffic'];
  readonly series = signal<TxChartSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.series.set([{ name: 'Health', data: [82, 95, 64, 71] }]);
      this.loading.set(false);
    }, 900);
  }
}
