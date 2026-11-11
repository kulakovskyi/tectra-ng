import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'funnel-chart-loading-and-empty-example',
  imports: [TxFunnelChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="items.set([])"></button>
      </div>
      <tx-funnel-chart [items]="items()" [loading]="loading()" ariaLabel="Loaded data" />
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
export default class FunnelChartLoadingAndEmptyExample {
  readonly items = signal<TxFunnelItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.items.set([
        { label: 'Invited', value: 200 },
        { label: 'Joined', value: 120 },
        { label: 'Active', value: 70 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
