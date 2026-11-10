import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'line-chart-loading-and-empty-example',
  imports: [TxLineChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="series.set([])"></button>
      </div>
      <tx-line-chart
        [series]="series()"
        [categories]="days"
        [loading]="loading()"
        [height]="280"
        ariaLabel="Sessions"
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
export default class LineChartLoadingAndEmptyExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  readonly series = signal<TxChartSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.series.set([{ name: 'Sessions', data: [320, 410, 380, 460, 520] }]);
      this.loading.set(false);
    }, 900);
  }
}
