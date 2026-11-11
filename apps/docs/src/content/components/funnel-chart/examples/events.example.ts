import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxFunnelChart, TxFunnelStageEvent, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-events-example',
  imports: [TxFunnelChart],
  template: `
    <div class="wrap">
      <tx-funnel-chart [items]="items" ariaLabel="Click a part" (stageClick)="onClick($event)" />
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
export default class FunnelChartEventsExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Leads', value: 800 },
    { label: 'Qualified', value: 340 },
    { label: 'Proposals', value: 120 },
    { label: 'Won', value: 45 },
  ];
  readonly message = signal('Click a step.');

  onClick(event: TxFunnelStageEvent): void {
    this.message.set(
      `${event.label}: ${event.value} (${event.conversion === null ? 'first step' : event.conversion.toFixed(1) + '% of the step before'})`,
    );
  }
}
