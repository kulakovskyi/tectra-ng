import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineContent } from '@tectra-ng/ui/timeline';

@Component({
  selector: 'timeline-design-tokens-example',
  imports: [TxTimeline, TxTimelineContent],
  template: `
    <tx-timeline
      ariaLabel="Order history"
      [value]="events"
      [dt]="{
        event: { minHeight: '48px' },
        eventMarker: {
          size: '18px',
          borderColor: 'var(--tx-primary-base)',
          contentSize: '8px',
        },
        eventConnector: { color: 'var(--tx-primary-base)', size: '3px' },
      }"
    >
      <ng-template txTimelineContent let-event>{{ event }}</ng-template>
    </tx-timeline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineDesignTokensExample {
  readonly events = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
}
