import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'scatter-chart-live-example',
  imports: [TxScatterChart, TxButton, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
        <tx-toggle-switch label="Bubbles" [(ngModel)]="bubbles" />
        <tx-toggle-switch label="Trend line" [(ngModel)]="trend" />
      </div>
      <tx-scatter-chart
        [series]="series()"
        [trendLine]="trend()"
        [height]="300"
        ariaLabel="Shuffled sample"
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
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartLiveExample {
  readonly bubbles = signal(false);
  readonly trend = signal(true);
  private readonly step = signal(0);

  readonly series = computed<TxScatterSeries[]>(() => {
    const step = this.step();
    const bubbles = this.bubbles();
    const sample = (offset: number, slope: number) =>
      Array.from({ length: 12 }, (_, index) => {
        const x = index * 5 + ((index * 7 + step * 3 + offset) % 5);
        const y = Math.round(slope * x + ((index * 13 + step * 11 + offset) % 23));
        return bubbles ? { x, y, size: 10 + ((index * 31 + step * 17) % 90) } : { x, y };
      });
    return [
      { name: 'Sample A', data: sample(0, 1.2) },
      { name: 'Sample B', data: sample(9, 0.6) },
    ];
  });

  shuffle(): void {
    this.step.update((step) => step + 1);
  }
}
