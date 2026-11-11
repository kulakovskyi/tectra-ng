import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxPluralPipe } from '@tectra-ng/utils/plural';

@Component({
  selector: 'plural-message-example',
  imports: [FormsModule, TxInputNumber, TxPluralPipe],
  template: `
    <div class="stack">
      <tx-input-number
        ariaLabel="Unread messages"
        [showButtons]="true"
        [min]="0"
        [(ngModel)]="count"
      />
      <span class="hint">{{ count() | txPlural: message }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PluralMessageExample {
  readonly count = signal<number | null>(1);
  readonly message =
    '{count, plural, =0 {No unread messages} one {# unread message} other {# unread messages}}';
}
