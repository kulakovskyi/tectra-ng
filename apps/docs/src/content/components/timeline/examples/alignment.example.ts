import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineContent } from '@tectra-ng/ui/timeline';

@Component({
  selector: 'timeline-alignment-example',
  imports: [TxTimeline, TxTimelineContent],
  template: `
    <div class="grid">
      <section>
        <h3 id="alignment-left">Left</h3>
        <tx-timeline ariaLabelledBy="alignment-left" [value]="events">
          <ng-template txTimelineContent let-event>{{ event }}</ng-template>
        </tx-timeline>
      </section>
      <section>
        <h3 id="alignment-right">Right</h3>
        <tx-timeline ariaLabelledBy="alignment-right" align="right" [value]="events">
          <ng-template txTimelineContent let-event>{{ event }}</ng-template>
        </tx-timeline>
      </section>
      <section>
        <h3 id="alignment-alternate">Alternate</h3>
        <tx-timeline ariaLabelledBy="alignment-alternate" align="alternate" [value]="events">
          <ng-template txTimelineContent let-event>{{ event }}</ng-template>
        </tx-timeline>
      </section>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }
    h3 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineAlignmentExample {
  readonly events = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
}
