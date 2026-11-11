import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'radial-bar-loading-and-empty-example',
  imports: [TxRadialBar, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="items.set([])"></button>
      </div>
      <tx-radial-bar
        [items]="items()"
        [loading]="loading()"
        [height]="240"
        ariaLabel="Upload progress"
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
export default class RadialBarLoadingAndEmptyExample {
  readonly items = signal<TxRadialBarItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.items.set([
        { label: 'Photos', value: 82 },
        { label: 'Videos', value: 37 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
