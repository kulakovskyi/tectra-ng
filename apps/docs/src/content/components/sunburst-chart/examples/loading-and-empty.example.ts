import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSunburstChart, TxSunburstItem } from '@tectra-ng/charts/sunburst';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'sunburst-chart-loading-and-empty-example',
  imports: [TxSunburstChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="data.set([])"></button>
      </div>
      <tx-sunburst-chart
        [data]="data()"
        [loading]="loading()"
        [height]="260"
        ariaLabel="Loaded hierarchy"
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
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SunburstChartLoadingAndEmptyExample {
  readonly data = signal<TxSunburstItem[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.data.set([
        { label: 'Done', value: 12 },
        {
          label: 'Open',
          children: [
            { label: 'Bugs', value: 5 },
            { label: 'Tasks', value: 7 },
          ],
        },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
