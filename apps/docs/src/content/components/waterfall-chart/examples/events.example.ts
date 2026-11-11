import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxWaterfallChart,
  TxWaterfallBarEvent,
  TxWaterfallItem,
} from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-events-example',
  imports: [TxWaterfallChart],
  template: `
    <div class="wrap">
      <tx-waterfall-chart [items]="items" ariaLabel="Click a part" (barClick)="onClick($event)" />
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
export default class WaterfallChartEventsExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Start', value: 120 },
    { label: 'Wins', value: 45 },
    { label: 'Losses', value: -30 },
    { label: 'Bonus', value: 15 },
    { label: 'End', total: true },
  ];
  readonly message = signal('Click a bar.');

  onClick(event: TxWaterfallBarEvent): void {
    this.message.set(`${event.label}: ${event.change} → ${event.total}`);
  }
}
