import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEmptyState, TxEmptyStateTone } from '@tectra-ng/blocks/empty-state';
import { TxIconName } from '@tectra-ng/icons';

@Component({
  selector: 'empty-state-tones-example',
  imports: [TxEmptyState],
  template: `
    <div class="grid">
      @for (item of tones; track item.tone) {
        <tx-empty-state
          size="compact"
          variant="inset"
          [tone]="item.tone"
          [icon]="item.icon"
          [title]="item.title"
          [text]="item.text"
        />
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateTonesExample {
  readonly tones: { tone: TxEmptyStateTone; icon: TxIconName; title: string; text: string }[] = [
    { tone: 'primary', icon: 'inbox', title: 'Inbox is empty', text: 'New requests land here.' },
    { tone: 'neutral', icon: 'file', title: 'No documents', text: 'Upload a file to share it.' },
    { tone: 'success', icon: 'check-circle', title: 'All done', text: 'Every task is closed.' },
    {
      tone: 'info',
      icon: 'info-circle',
      title: 'Nothing to review',
      text: 'Reviews show up here.',
    },
    { tone: 'warn', icon: 'clock', title: 'No schedule', text: 'Pick the hours to run.' },
    {
      tone: 'danger',
      icon: 'exclamation-triangle',
      title: 'Sync failed',
      text: 'Try again in a minute.',
    },
  ];
}
