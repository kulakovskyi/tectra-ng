import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxScatterChart,
  TxScatterChartPointEvent,
  TxScatterChartSeriesToggle,
  TxScatterSeries,
} from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-events-example',
  imports: [TxScatterChart],
  template: `
    <div class="wrap">
      <tx-scatter-chart
        [series]="series"
        [height]="280"
        xAxisTitle="Story points"
        yAxisTitle="Days"
        ariaLabel="Story points and days to close"
        (pointClick)="onPoint($event)"
        (seriesToggle)="onToggle($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
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
export default class ScatterChartEventsExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Features',
      data: [
        { x: 3, y: 4, label: 'Export' },
        { x: 5, y: 7, label: 'Filters' },
        { x: 8, y: 12, label: 'Reports' },
      ],
    },
    {
      name: 'Bugs',
      data: [
        { x: 1, y: 1, label: 'Typo' },
        { x: 2, y: 3, label: 'Crash' },
        { x: 5, y: 4, label: 'Sync' },
      ],
    },
  ];
  readonly message = signal('Click a point or a legend item.');

  onPoint(event: TxScatterChartPointEvent): void {
    this.message.set(
      `${this.series[event.seriesIndex].name}: ${event.label} — ${event.x} points, ${event.y} days`,
    );
  }

  onToggle(event: TxScatterChartSeriesToggle): void {
    this.message.set(`${event.name} is ${event.hidden ? 'hidden' : 'shown'}`);
  }
}
