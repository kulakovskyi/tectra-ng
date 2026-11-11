import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'bullet-chart-loading-and-empty-example',
  imports: [TxBulletChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="items.set([])"></button>
      </div>
      <tx-bullet-chart
        [items]="items()"
        [ranges]="[50, 80]"
        [max]="100"
        [loading]="loading()"
        ariaLabel="Loaded data"
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
export default class BulletChartLoadingAndEmptyExample {
  readonly items = signal<TxBulletItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.items.set([
        { label: 'Week', value: 72, target: 80 },
        { label: 'Month', value: 64, target: 75 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
