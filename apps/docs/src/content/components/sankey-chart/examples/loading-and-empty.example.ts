import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'sankey-chart-loading-and-empty-example',
  imports: [TxSankeyChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="links.set([])"></button>
      </div>
      <tx-sankey-chart
        [links]="links()"
        [loading]="loading()"
        [height]="240"
        ariaLabel="Loaded flows"
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
export default class SankeyChartLoadingAndEmptyExample {
  readonly links = signal<TxSankeyLink[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.links.set([
        { source: 'Visits', target: 'Cart', value: 300 },
        { source: 'Cart', target: 'Order', value: 120 },
        { source: 'Cart', target: 'Left', value: 180 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
