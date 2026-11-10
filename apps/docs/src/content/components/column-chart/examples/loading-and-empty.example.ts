import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'column-chart-loading-and-empty-example',
  imports: [TxColumnChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="series.set([])"></button>
      </div>
      <tx-column-chart
        [series]="series()"
        [categories]="weeks"
        [loading]="loading()"
        [height]="260"
        ariaLabel="Signups by week"
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
export default class ColumnChartLoadingAndEmptyExample {
  readonly weeks = ['W1', 'W2', 'W3', 'W4'];
  readonly series = signal<TxChartSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.series.set([{ name: 'Signups', data: [140, 180, 165, 210] }]);
      this.loading.set(false);
    }, 900);
  }
}
