import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'funnel-chart-live-example',
  imports: [TxFunnelChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-funnel-chart [items]="items()" ariaLabel="Shuffled data" />
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
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartLiveExample {
  private step = 0;
  readonly items = signal<TxFunnelItem[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.items.set(this.build(this.step));
  }

  private build(step: number): TxFunnelItem[] {
    let value = 1000;
    return ['Visits', 'Product views', 'Carts', 'Orders'].map((label, index) => {
      if (index) value = Math.round(value * (0.25 + ((step * 17 + index * 29) % 50) / 100));
      return { label, value };
    });
  }
}
