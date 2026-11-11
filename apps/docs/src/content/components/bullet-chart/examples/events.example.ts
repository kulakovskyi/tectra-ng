import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBulletChart, TxBulletEvent, TxBulletItem } from '@tectra-ng/charts/bullet';

@Component({
  selector: 'bullet-chart-events-example',
  imports: [TxBulletChart],
  template: `
    <div class="wrap">
      <tx-bullet-chart
        [items]="items"
        [ranges]="[50, 80]"
        [max]="100"
        ariaLabel="Click a part"
        (barClick)="onClick($event)"
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
export default class BulletChartEventsExample {
  readonly items: TxBulletItem[] = [
    { label: 'Sales', value: 64, target: 70 },
    { label: 'Leads', value: 82, target: 75 },
  ];
  readonly message = signal('Click a row.');

  onClick(event: TxBulletEvent): void {
    this.message.set(`${event.label}: ${event.value} of ${event.target}`);
  }
}
