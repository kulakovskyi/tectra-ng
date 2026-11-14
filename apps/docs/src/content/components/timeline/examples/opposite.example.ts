import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineContent, TxTimelineOpposite } from '@tectra-ng/ui/timeline';

interface OrderEvent {
  status: string;
  date: string;
}

@Component({
  selector: 'timeline-opposite-example',
  imports: [TxTimeline, TxTimelineContent, TxTimelineOpposite],
  template: `
    <tx-timeline ariaLabel="Order history" [value]="events">
      <ng-template txTimelineOpposite [txTimelineOppositeOf]="events" let-event>
        <span class="date">{{ event.date }}</span>
      </ng-template>
      <ng-template txTimelineContent [txTimelineContentOf]="events" let-event>{{
        event.status
      }}</ng-template>
    </tx-timeline>
  `,
  styles: `
    .date {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineOppositeExample {
  readonly events: OrderEvent[] = [
    { status: 'Ordered', date: '15/10/2026 10:30' },
    { status: 'Processing', date: '15/10/2026 14:00' },
    { status: 'Shipped', date: '15/10/2026 16:15' },
    { status: 'Delivered', date: '16/10/2026 10:00' },
  ];
}
