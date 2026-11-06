import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'tag-copyable-example',
  imports: [TxTag],
  template: `
    <div class="row">
      <tx-tag severity="secondary" [copyable]="true" (copied)="toast.success('Copied ' + $event)"
        >ord_8F2KQ1</tx-tag
      >
      <tx-tag severity="info" [copyable]="true" (copied)="toast.success('Copied ' + $event)"
        >sk_live_7Hc…a91</tx-tag
      >
    </div>
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
  readonly toast = inject(TxToastService);
}
