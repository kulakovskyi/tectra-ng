import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChipsInput, TxChipsInputEvent } from '@tectra-ng/ui/chips-input';

@Component({
  selector: 'chips-input-limits-example',
  imports: [TxChipsInput],
  template: `
    <div class="stack">
      <tx-chips-input
        [max]="3"
        [maxLength]="12"
        [placeholder]="'Up to 3 tags'"
        (rejected)="reject($event)"
      />
      <span class="hint">{{ message() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputLimitsExample {
  readonly message = signal('Duplicates and a fourth tag are rejected.');

  reject(event: TxChipsInputEvent): void {
    this.message.set(`“${event.value}” was not added.`);
  }
}
