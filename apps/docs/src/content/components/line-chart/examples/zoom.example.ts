import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

function traffic(days: number): number[] {
  return Array.from({ length: days }, (_, index) =>
    Math.round(1200 + Math.sin(index / 5) * 260 + Math.cos(index / 2.3) * 90 + index * 6),
  );
}

@Component({
  selector: 'line-chart-zoom-example',
  imports: [TxLineChart],
  template: `
    <div class="wrap">
      <tx-line-chart
        [series]="series"
        [categories]="days"
        xType="time"
        zoom
        [(xRange)]="range"
        [height]="320"
        ariaLabel="Daily visits"
      />
      <p class="log" aria-live="polite">{{ range() ? 'Zoomed in' : 'Whole range' }}</p>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartZoomExample {
  readonly days = Array.from({ length: 120 }, (_, index) => new Date(2026, 6, 1 + index));
  readonly series: TxChartSeries[] = [{ name: 'Visits', data: traffic(120) }];
  readonly range = signal<readonly [number, number] | null>(null);
}
