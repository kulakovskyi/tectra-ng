import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxComboChart,
  TxComboChartPointEvent,
  TxComboChartSeries,
  TxComboChartSeriesToggle,
} from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-events-example',
  imports: [TxComboChart],
  template: `
    <div class="wrap">
      <tx-combo-chart
        [series]="series"
        [categories]="months"
        [height]="280"
        ariaLabel="Deliveries and on-time rate"
        y2ValueFormat="percent"
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
export default class ComboChartEventsExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Deliveries', data: [1200, 1340, 1280, 1460, 1530, 1610] },
    { name: 'On time', data: [91, 93, 89, 95, 96, 94], type: 'line', axis: 'secondary' },
  ];
  readonly message = signal('Click a month or a legend item.');

  onPoint(event: TxComboChartPointEvent): void {
    this.message.set(`${this.series[event.seriesIndex].name}, ${event.category}: ${event.value}`);
  }

  onToggle(event: TxComboChartSeriesToggle): void {
    this.message.set(`${event.name} is ${event.hidden ? 'hidden' : 'shown'}`);
  }
}
