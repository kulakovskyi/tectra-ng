import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSunburstChart, TxSunburstItem } from '@tectra-ng/charts/sunburst';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'sunburst-chart-live-example',
  imports: [TxSunburstChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-sunburst-chart [data]="data()" [height]="300" ariaLabel="Shuffled hierarchy" />
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
export default class SunburstChartLiveExample {
  private step = 0;
  readonly data = signal<TxSunburstItem[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.data.set(this.build(this.step));
  }

  private build(step: number): TxSunburstItem[] {
    const value = (offset: number) => 4 + ((step * 23 + offset) % 18);
    return [
      {
        label: 'A',
        children: [
          { label: 'A1', value: value(0) },
          { label: 'A2', value: value(5) },
        ],
      },
      {
        label: 'B',
        children: [
          { label: 'B1', value: value(9) },
          { label: 'B2', value: value(13) },
        ],
      },
      { label: 'C', value: value(17) },
    ];
  }
}
