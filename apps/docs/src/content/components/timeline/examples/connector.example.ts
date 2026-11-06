import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTimeline, TxTimelineConnector, TxTimelineContent } from '@tectra-ng/ui/timeline';

interface Step {
  title: string;
  done: boolean;
}

@Component({
  selector: 'timeline-connector-example',
  imports: [TxTimeline, TxTimelineContent, TxTimelineConnector],
  template: `
    <tx-timeline ariaLabel="Setup progress" [value]="steps" [pt]="pt">
      <ng-template txTimelineConnector let-step>
        <span class="line" [class.line--done]="step.done" aria-hidden="true"></span>
      </ng-template>
      <ng-template txTimelineContent let-step>
        <span [class.muted]="!step.done">{{ step.title }}</span>
      </ng-template>
    </tx-timeline>
  `,
  styles: `
    .line {
      flex-grow: 1;
      border-inline-start: 2px dashed var(--tx-surface-border);
    }
    .line--done {
      border-inline-start-style: solid;
      border-inline-start-color: var(--tx-primary-base);
    }
    .muted {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineConnectorExample {
  readonly pt = { eventOpposite: { style: { flex: '0' } } };
  readonly steps: Step[] = [
    { title: 'Account created', done: true },
    { title: 'Domain verified', done: true },
    { title: 'Team invited', done: false },
    { title: 'First project published', done: false },
  ];
}
