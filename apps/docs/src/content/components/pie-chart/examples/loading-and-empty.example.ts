import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'pie-chart-loading-and-empty-example',
  imports: [TxPieChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="data.set(empty)"></button>
      </div>
      <tx-pie-chart
        [pieData]="data()"
        [loading]="loading()"
        [chartWidth]="240"
        [chartHeight]="280"
        ariaLabel="Plans"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartLoadingAndEmptyExample {
  readonly empty: TxPieData = { series: [], labels: [] };
  readonly data = signal<TxPieData>(this.empty);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.data.set({ series: [120, 64, 22], labels: ['Free', 'Pro', 'Team'] });
      this.loading.set(false);
    }, 900);
  }
}
