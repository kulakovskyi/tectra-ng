import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineContent } from '@tectra-ng/ui/timeline';

@Component({
  selector: 'timeline-basic-example',
  imports: [TxTimeline, TxTimelineContent],
  template: `
    <tx-timeline ariaLabel="Order history" [value]="events">
      <ng-template txTimelineContent let-event>{{ event }}</ng-template>
    </tx-timeline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineBasicExample {
  readonly events = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
}
