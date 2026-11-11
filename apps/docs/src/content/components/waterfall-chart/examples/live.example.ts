import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'waterfall-chart-live-example',
  imports: [TxWaterfallChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-waterfall-chart [items]="items()" ariaLabel="Shuffled data" />
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
export default class WaterfallChartLiveExample {
  private step = 0;
  readonly items = signal<TxWaterfallItem[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.items.set(this.build(this.step));
  }

  private build(step: number): TxWaterfallItem[] {
    const change = (offset: number, span: number) => ((step * 31 + offset) % span) - span / 3;
    return [
      { label: 'Opening', value: 200 },
      { label: 'Q1', value: Math.round(change(7, 120)) },
      { label: 'Q2', value: Math.round(change(19, 120)) },
      { label: 'Q3', value: Math.round(change(43, 120)) },
      { label: 'Q4', value: Math.round(change(71, 120)) },
      { label: 'Closing', total: true },
    ];
  }
}
