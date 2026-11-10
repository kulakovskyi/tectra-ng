import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTreemap, TxTreemapItem } from '@tectra-ng/charts/treemap';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'treemap-loading-and-empty-example',
  imports: [TxTreemap, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="items.set([])"></button>
      </div>
      <tx-treemap
        [items]="items()"
        [loading]="loading()"
        [height]="260"
        ariaLabel="Tickets by team"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
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
export default class TreemapLoadingAndEmptyExample {
  readonly items = signal<TxTreemapItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.items.set([
        { label: 'Support', value: 84 },
        { label: 'Billing', value: 41 },
        { label: 'Platform', value: 27 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
