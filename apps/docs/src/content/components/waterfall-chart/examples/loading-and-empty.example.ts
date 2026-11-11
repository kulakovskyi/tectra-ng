import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'waterfall-chart-loading-and-empty-example',
  imports: [TxWaterfallChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="items.set([])"></button>
      </div>
      <tx-waterfall-chart [items]="items()" [loading]="loading()" ariaLabel="Loaded data" />
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
export default class WaterfallChartLoadingAndEmptyExample {
  readonly items = signal<TxWaterfallItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.items.set([
        { label: 'Before', value: 80 },
        { label: 'Change', value: -20 },
        { label: 'After', total: true },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
