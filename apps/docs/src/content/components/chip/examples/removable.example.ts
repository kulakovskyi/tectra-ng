import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChip } from '@tectra/ui/chip';

@Component({
  selector: 'chip-removable-example',
  imports: [TxChip],
  template: `
    <div class="field">
      <span class="to">To:</span>
      @for (email of recipients(); track email) {
        <tx-chip
          [label]="email"
          icon="envelope"
          [removable]="true"
          [removeLabel]="'Remove ' + email"
          (removed)="remove(email)"
        />
      } @empty {
        <span class="hint">No recipients</span>
      }
    </div>
  `,
  styles: `
    .field {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      min-height: 30px;
    }

    .to {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipRemovableExample {
  readonly recipients = signal(['olena@example.com', 'taras@example.com', 'team@example.com']);

  remove(email: string): void {
    this.recipients.update((list) => list.filter((item) => item !== email));
  }
}
