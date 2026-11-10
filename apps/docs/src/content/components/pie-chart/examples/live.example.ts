import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxPieChart,
  TxPieData,
  TxPieSegmentEvent,
  TxPieSegmentToggle,
} from '@tectra-ng/charts/pie';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'pie-chart-live-example',
  imports: [TxPieChart, TxButton],
  template: `
    <div class="wrap">
      <button
        class="action"
        txButton
        label="Next week"
        variant="outlined"
        (click)="next()"
      ></button>
      <tx-pie-chart
        [pieData]="data()"
        [chartWidth]="260"
        [chartHeight]="320"
        totalLabel="Hours"
        ariaLabel="Hours by activity"
        (segmentClick)="onClick($event)"
        (segmentToggle)="onToggle($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartLiveExample {
  private readonly weeks = [
    [14, 9, 6, 4],
    [10, 12, 5, 7],
    [18, 6, 8, 2],
  ];
  private week = 0;
  readonly data = signal<TxPieData>(this.build(0));
  readonly message = signal('Click a segment or a legend item.');

  next(): void {
    this.week += 1;
    this.data.set(this.build(this.week));
  }

  onClick(event: TxPieSegmentEvent): void {
    this.message.set(`${event.label}: ${event.value} h (${event.percent.toFixed(1)}%)`);
  }

  onToggle(event: TxPieSegmentToggle): void {
    this.message.set(`${event.label} is ${event.hidden ? 'hidden' : 'shown'}`);
  }

  private build(week: number): TxPieData {
    return {
      series: this.weeks[week % this.weeks.length],
      labels: ['Coding', 'Meetings', 'Review', 'Learning'],
    };
  }
}
