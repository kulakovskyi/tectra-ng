import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxLink } from '@tectra/ui/link';

@Component({
  selector: 'link-copy-example',
  imports: [TxLink],
  template: `
    <div class="column">
      <tx-link
        link="docs.example.com/getting-started"
        [copyable]="true"
        (copied)="last.set($event)"
      />
      <tx-link
        link="billing@example.com"
        type="email"
        [copyable]="true"
        (copied)="last.set($event)"
      />
    </div>
    <p class="status" aria-live="polite">{{ last() ? 'Copied ' + last() : '' }}</p>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .status {
      min-height: 20px;
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkCopyExample {
  readonly last = signal('');
}
