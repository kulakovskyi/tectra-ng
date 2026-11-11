import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'range-area-chart-live-example',
  imports: [TxRangeAreaChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-range-area-chart
        [series]="live()"
        [categories]="['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
        [height]="300"
        ariaLabel="Shuffled data"
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
export default class RangeAreaChartLiveExample {
  private step = 0;
  readonly live = signal<TxRangeSeries[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.live.set(this.build(this.step));
  }

  private build(step: number): TxRangeSeries[] {
    const value = (index: number, offset: number) => 40 + ((index * 17 + step * 23 + offset) % 30);
    const line = [0, 1, 2, 3, 4].map((index) => value(index, 0));
    return [
      {
        name: 'Load',
        low: line.map((item, index) => item - 8 - (index % 3) * 3),
        high: line.map((item, index) => item + 10 + ((index + step) % 3) * 4),
        line,
      },
    ];
  }
}
