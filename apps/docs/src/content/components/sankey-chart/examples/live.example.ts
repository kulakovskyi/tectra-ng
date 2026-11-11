import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'sankey-chart-live-example',
  imports: [TxSankeyChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Next month" variant="outlined" (click)="next()"></button>
      </div>
      <tx-sankey-chart [links]="links()" [height]="280" ariaLabel="Monthly flows" />
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
export default class SankeyChartLiveExample {
  private month = 0;
  readonly links = signal<TxSankeyLink[]>(this.build(0));

  next(): void {
    this.month += 1;
    this.links.set(this.build(this.month));
  }

  private build(month: number): TxSankeyLink[] {
    const value = (offset: number) => 20 + ((month * 37 + offset) % 60);
    return [
      { source: 'Web', target: 'Trial', value: value(0) },
      { source: 'App', target: 'Trial', value: value(17) },
      { source: 'Trial', target: 'Paid', value: value(29) },
      { source: 'Trial', target: 'Churned', value: value(41) },
    ];
  }
}
