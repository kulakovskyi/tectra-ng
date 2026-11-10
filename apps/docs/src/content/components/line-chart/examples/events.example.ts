import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import {
  TxLineChart,
  TxLineChartPointEvent,
  TxLineChartSeriesToggle,
} from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-events-example',
  imports: [TxLineChart],
  template: `
    <div class="wrap">
      <tx-line-chart
        [series]="series"
        [categories]="months"
        [height]="280"
        ariaLabel="New and returning customers"
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
export default class LineChartEventsExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxChartSeries[] = [
    { name: 'New', data: [120, 140, 132, 160, 171, 190] },
    { name: 'Returning', data: [310, 320, 342, 351, 377, 392] },
  ];
  readonly message = signal('Click a point or a legend item.');

  onPoint(event: TxLineChartPointEvent): void {
    this.message.set(`${this.series[event.seriesIndex].name}, ${event.category}: ${event.value}`);
  }

  onToggle(event: TxLineChartSeriesToggle): void {
    this.message.set(`${event.name} is ${event.hidden ? 'hidden' : 'shown'}`);
  }
}
