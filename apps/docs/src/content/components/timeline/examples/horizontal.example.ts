import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineContent, TxTimelineOpposite } from '@tectra-ng/ui/timeline';

@Component({
  selector: 'timeline-horizontal-example',
  imports: [TxTimeline, TxTimelineContent, TxTimelineOpposite],
  template: `
    <div class="rows">
      <tx-timeline ariaLabel="Release plan, line above" layout="horizontal" [value]="events">
        <ng-template txTimelineContent let-event>{{ event }}</ng-template>
      </tx-timeline>
      <tx-timeline
        ariaLabel="Release plan, line below"
        layout="horizontal"
        align="bottom"
        [value]="events"
      >
        <ng-template txTimelineContent let-event>{{ event }}</ng-template>
      </tx-timeline>
      <tx-timeline
        ariaLabel="Release plan, alternating"
        layout="horizontal"
        align="alternate"
        [value]="events"
      >
        <ng-template txTimelineContent let-event>{{ event }}</ng-template>
        <ng-template txTimelineOpposite>&nbsp;</ng-template>
      </tx-timeline>
    </div>
  `,
  styles: `
    .rows {
      display: grid;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineHorizontalExample {
  readonly events = ['2023', '2024', '2025', '2026'];
}
