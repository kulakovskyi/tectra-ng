import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'tag-copyable-example',
  imports: [TxTag],
  template: `
    <div class="row">
      <tx-tag severity="secondary" [copyable]="true" (copied)="last.set($event)">ord_8F2KQ1</tx-tag>
      <tx-tag severity="info" [copyable]="true" (copied)="last.set($event)">sk_live_7Hc…a91</tx-tag>
    </div>
    <p class="hint">{{ last() ? 'Copied ' + last() : 'Press the copy icon' }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagCopyableExample {
  readonly last = signal('');
}
