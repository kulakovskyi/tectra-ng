import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'bar-list-loading-and-empty-example',
  imports: [TxBarList, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="items.set([])"></button>
      </div>
      <tx-bar-list [items]="items()" [loading]="loading()" ariaLabel="Signups by source" />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      max-width: 480px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListLoadingAndEmptyExample {
  readonly items = signal<TxBarListItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.items.set([
        { label: 'Search', value: 412 },
        { label: 'Invite', value: 286 },
        { label: 'Blog', value: 145 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
