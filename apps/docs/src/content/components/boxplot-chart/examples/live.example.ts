import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBoxplotChart, TxBoxplotSeries } from '@tectra-ng/charts/boxplot';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'boxplot-chart-live-example',
  imports: [TxBoxplotChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-boxplot-chart
        [series]="live()"
        [categories]="['A', 'B', 'C']"
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
export default class BoxplotChartLiveExample {
  private step = 0;
  readonly live = signal<TxBoxplotSeries[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.live.set(this.build(this.step));
  }

  private build(step: number): TxBoxplotSeries[] {
    const values = (centre: number, offset: number) =>
      Array.from(
        { length: 24 },
        (_, index) => centre + ((index * 29 + step * 41 + offset) % 23) - 11,
      );
    return [{ name: 'Sample', data: [values(40, 0), values(55, 7), values(48, 13)] }];
  }
}
