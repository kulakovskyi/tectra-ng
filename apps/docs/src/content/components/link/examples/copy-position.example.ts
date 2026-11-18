import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxLink } from '@tectra-ng/ui/link';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'link-copy-position-example',
  imports: [TxLink],
  template: `
    <div class="column">
      @for (email of emails; track email) {
        <tx-link
          type="email"
          copyPosition="start"
          [link]="email"
          [maxLength]="24"
          [copyable]="true"
          (copied)="toast.success('Copied ' + $event)"
          (copyFailed)="toast.error('Could not copy ' + $event)"
        />
      }
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
export default class LinkCopyPositionExample {
  readonly toast = inject(TxToastService);
  readonly emails = [
    'ann@example.com',
    'support.team@example.com',
    'billing.department.europe@example.com',
  ];
}
