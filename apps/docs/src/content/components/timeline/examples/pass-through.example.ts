import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineContent, TxTimelineOpposite } from '@tectra-ng/ui/timeline';

interface Release {
  version: string;
  date: string;
}

@Component({
  selector: 'timeline-pass-through-example',
  imports: [TxTimeline, TxTimelineContent, TxTimelineOpposite],
  template: `
    <tx-timeline ariaLabel="Releases" [value]="releases" [pt]="pt">
      <ng-template txTimelineOpposite let-release>{{ release.date }}</ng-template>
      <ng-template txTimelineContent let-release>
        <strong>{{ release.version }}</strong>
      </ng-template>
    </tx-timeline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelinePassThroughExample {
  readonly pt = {
    eventOpposite: { style: { flex: '0 0 96px', color: 'var(--tx-text-muted)' } },
    eventContent: { style: { paddingBottom: '16px' } },
  };
  readonly releases: Release[] = [
    { version: '2.4.0', date: 'Nov 2026' },
    { version: '2.3.1', date: 'Sep 2026' },
    { version: '2.3.0', date: 'Aug 2026' },
    { version: '2.2.0', date: 'May 2026' },
  ];
}
