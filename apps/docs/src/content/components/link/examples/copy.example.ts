import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxLink } from '@tectra-ng/ui/link';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'link-copy-example',
  imports: [TxLink],
  template: `
    <div class="column">
      <tx-link
        link="docs.example.com/getting-started"
        [copyable]="true"
        (copied)="toast.success('Copied ' + $event)"
      />
      <tx-link
        link="billing@example.com"
        type="email"
        [copyable]="true"
        (copied)="toast.success('Copied ' + $event)"
      />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkCopyExample {
  readonly toast = inject(TxToastService);
}
