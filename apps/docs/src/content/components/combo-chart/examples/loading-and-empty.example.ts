import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'combo-chart-loading-and-empty-example',
  imports: [TxComboChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="series.set([])"></button>
      </div>
      <tx-combo-chart
        [series]="series()"
        [categories]="weeks"
        [loading]="loading()"
        [height]="260"
        ariaLabel="Builds and failure rate by week"
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
export default class ComboChartLoadingAndEmptyExample {
  readonly weeks = ['W1', 'W2', 'W3', 'W4'];
  readonly series = signal<TxComboChartSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.series.set([
        { name: 'Builds', data: [140, 180, 165, 210] },
        { name: 'Failed, %', data: [6.1, 4.8, 5.2, 3.9], type: 'line', axis: 'secondary' },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
