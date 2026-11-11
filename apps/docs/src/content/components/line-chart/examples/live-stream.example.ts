import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'line-chart-live-stream-example',
  imports: [TxLineChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button
          txButton
          [label]="running() ? 'Pause' : 'Play'"
          variant="outlined"
          (click)="running.set(!running())"
        ></button>
      </div>
      <tx-line-chart
        [series]="series()"
        [categories]="labels()"
        [maxPoints]="30"
        live
        [area]="false"
        curve="straight"
        [height]="260"
        ariaLabel="Requests per second"
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
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartLiveStreamExample {
  private tick = 40;
  private values = Array.from({ length: 40 }, (_, index) => this.sample(index));
  readonly running = signal(false);
  readonly series = signal<TxChartSeries[]>([{ name: 'Requests', data: this.values }]);
  readonly labels = signal(this.values.map((_, index) => `${index}s`));

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.running() && this.push(), 1000);
      destroy.onDestroy(() => clearInterval(timer));
    });
  }

  private push(): void {
    this.values = [...this.values.slice(-59), this.sample(this.tick)];
    this.tick += 1;
    this.series.set([{ name: 'Requests', data: this.values }]);
    this.labels.set(this.values.map((_, index) => `${this.tick - this.values.length + index}s`));
  }

  private sample(index: number): number {
    return Math.round(120 + Math.sin(index / 3) * 30 + Math.cos(index * 1.7) * 12);
  }
}
