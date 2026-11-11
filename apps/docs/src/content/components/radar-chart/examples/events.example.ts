import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import {
  TxRadarChart,
  TxRadarChartPointEvent,
  TxRadarChartSeriesToggle,
} from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-events-example',
  imports: [TxRadarChart],
  template: `
    <div class="wrap">
      <tx-radar-chart
        [series]="series"
        [categories]="areas"
        [height]="300"
        ariaLabel="Survey answers"
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
export default class RadarChartEventsExample {
  readonly areas = ['Onboarding', 'Search', 'Checkout', 'Support', 'Mobile'];
  readonly series: TxChartSeries[] = [
    { name: 'This year', data: [78, 64, 81, 72, 69] },
    { name: 'Last year', data: [70, 58, 74, 75, 52] },
  ];
  readonly message = signal('Click an axis or a legend item.');

  onPoint(event: TxRadarChartPointEvent): void {
    this.message.set(`${this.series[event.seriesIndex].name}, ${event.category}: ${event.value}`);
  }

  onToggle(event: TxRadarChartSeriesToggle): void {
    this.message.set(`${event.name} is ${event.hidden ? 'hidden' : 'shown'}`);
  }
}
