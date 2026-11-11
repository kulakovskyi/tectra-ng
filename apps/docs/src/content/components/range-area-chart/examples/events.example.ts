import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxRangeAreaChart,
  TxRangeAreaPointEvent,
  TxRangeSeries,
} from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-events-example',
  imports: [TxRangeAreaChart],
  template: `
    <div class="wrap">
      <tx-range-area-chart
        [series]="data"
        [categories]="['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
        [height]="280"
        ariaLabel="Click a part"
        (pointClick)="onClick($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
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
export default class RangeAreaChartEventsExample {
  readonly data: TxRangeSeries[] = [
    {
      name: 'Visitors',
      low: [120, 140, 130, 150, 170],
      high: [260, 300, 280, 320, 360],
      line: [180, 210, 200, 230, 260],
    },
  ];
  readonly message = signal('Click the chart.');

  onClick(event: TxRangeAreaPointEvent): void {
    this.message.set(`${event.category}: ${event.line} (${event.low} – ${event.high})`);
  }
}
