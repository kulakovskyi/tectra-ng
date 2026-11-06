import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon, TxIconName } from '@tectra-ng/icons';
import { TxPill, TxPillTone } from '@tectra-ng/ui/pill';
import {
  TxTimeline,
  TxTimelineContent,
  TxTimelineMarker,
  TxTimelineOpposite,
} from '@tectra-ng/ui/timeline';

interface OrderEvent {
  status: string;
  date: string;
  icon: TxIconName;
  tone: Extract<TxPillTone, 'primary' | 'info' | 'warn' | 'success'>;
  note: string;
}

@Component({
  selector: 'timeline-template-example',
  imports: [TxTimeline, TxTimelineContent, TxTimelineMarker, TxTimelineOpposite, TxIcon, TxPill],
  template: `
    <tx-timeline ariaLabel="Order history" align="alternate" [value]="events" [pt]="pt">
      <ng-template txTimelineMarker let-event>
        <span class="marker" [attr.data-tone]="event.tone" aria-hidden="true">
          <tx-icon [name]="event.icon" />
        </span>
      </ng-template>
      <ng-template txTimelineOpposite let-event>
        <span class="date">{{ event.date }}</span>
      </ng-template>
      <ng-template txTimelineContent let-event>
        <article class="card">
          <header class="head">
            <strong>{{ event.status }}</strong>
            <tx-pill size="small" [tone]="event.tone">{{
              event.tone === 'success' ? 'Done' : 'Step'
            }}</tx-pill>
          </header>
          <p>{{ event.note }}</p>
        </article>
      </ng-template>
    </tx-timeline>
  `,
  styles: `
    .marker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 14px;
    }
    .marker[data-tone='primary'] {
      background: var(--tx-primary-base);
      color: var(--tx-primary-contrast);
    }
    .marker[data-tone='info'] {
      background: var(--tx-info-base);
      color: var(--tx-info-contrast);
    }
    .marker[data-tone='warn'] {
      background: var(--tx-warn-base);
      color: var(--tx-warn-contrast);
    }
    .marker[data-tone='success'] {
      background: var(--tx-success-base);
      color: var(--tx-success-contrast);
    }
    .date {
      color: var(--tx-text-muted);
      font-size: 13px;
    }
    .card {
      display: inline-grid;
      gap: 6px;
      max-width: 260px;
      margin-bottom: 20px;
      padding: 12px 14px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      background: var(--tx-surface-card);
      text-align: start;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .card p {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TimelineTemplateExample {
  readonly pt = { eventContent: { style: { paddingBottom: '0' } } };
  readonly events: OrderEvent[] = [
    {
      status: 'Ordered',
      date: '15/10 10:30',
      icon: 'shopping-cart',
      tone: 'primary',
      note: 'Two items, paid by card.',
    },
    {
      status: 'Processing',
      date: '15/10 14:00',
      icon: 'cog',
      tone: 'info',
      note: 'Packed at the north warehouse.',
    },
    {
      status: 'Shipped',
      date: '15/10 16:15',
      icon: 'truck',
      tone: 'warn',
      note: 'Handed to the courier, tracking sent.',
    },
    {
      status: 'Delivered',
      date: '16/10 10:00',
      icon: 'check',
      tone: 'success',
      note: 'Signed for at the front desk.',
    },
  ];
}
