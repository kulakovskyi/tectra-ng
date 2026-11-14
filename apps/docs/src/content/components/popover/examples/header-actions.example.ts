import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTimeline, TxTimelineContent } from '@tectra-ng/ui/timeline';

interface Notice {
  text: string;
  time: string;
}

@Component({
  selector: 'popover-header-actions-example',
  imports: [TxPopover, TxPopoverTrigger, TxButton, TxTimeline, TxTimelineContent],
  template: `
    <button txButton severity="secondary" [outlined]="true" icon="bell" [txPopoverTrigger]="inbox">
      Notifications ({{ unread() }})
    </button>
    <tx-popover #inbox header="Notifications" placement="bottom-start">
      <button
        txPopoverHeader
        txButton
        size="small"
        severity="secondary"
        [text]="true"
        [disabled]="!unread()"
        (click)="unread.set(0)"
      >
        Mark all as read
      </button>
      <tx-timeline ariaLabel="Recent notifications" [value]="notices">
        <ng-template txTimelineContent let-notice [txTimelineContentOf]="notices">
          <span class="text">{{ notice.text }}</span>
          <span class="time">{{ notice.time }}</span>
        </ng-template>
      </tx-timeline>
    </tx-popover>
  `,
  styles: `
    tx-timeline {
      width: 280px;
      max-width: 100%;
    }
    .text {
      display: block;
    }
    .time {
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverHeaderActionsExample {
  readonly unread = signal(3);
  readonly notices: Notice[] = [
    { text: 'The weekly report is ready', time: '5 minutes ago' },
    { text: 'Two invoices are due tomorrow', time: '1 hour ago' },
    { text: 'A new teammate joined', time: 'Yesterday' },
  ];
}
