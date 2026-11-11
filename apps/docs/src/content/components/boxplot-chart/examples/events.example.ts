import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBoxplotChart, TxBoxplotEvent, TxBoxplotSeries } from '@tectra-ng/charts/boxplot';

@Component({
  selector: 'boxplot-chart-events-example',
  imports: [TxBoxplotChart],
  template: `
    <div class="wrap">
      <tx-boxplot-chart
        [series]="data"
        [categories]="['A', 'B', 'C']"
        [height]="280"
        ariaLabel="Click a part"
        (boxClick)="onClick($event)"
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
export default class BoxplotChartEventsExample {
  readonly data: TxBoxplotSeries[] = [
    {
      name: 'Wait time',
      data: [
        [4, 6, 7, 8, 9, 11, 12, 30],
        [2, 3, 3, 4, 5, 6, 7],
        [8, 10, 12, 13, 15, 18, 22],
      ],
    },
  ];
  readonly message = signal('Click the chart.');

  onClick(event: TxBoxplotEvent): void {
    this.message.set(`${event.category}: median ${event.stats.median}`);
  }
}
