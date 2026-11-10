import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-copy-example',
  imports: [TxTruncateText],
  template: `
    <tx-truncate-text
      text="sk_test_51Hc8f2LkA9xQm3Vt7Rz0pWnYbEuJd"
      [limit]="14"
      copyable
      (copied)="last.set($event)"
    />
    <p class="result">{{ last() ? 'Copied: ' + last() : 'Nothing copied yet' }}</p>
  `,
  styles: `
    .result {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextCopyExample {
  readonly last = signal('');
}
