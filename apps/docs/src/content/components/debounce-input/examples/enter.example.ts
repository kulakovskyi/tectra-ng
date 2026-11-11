import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxDebounceInput } from '@tectra-ng/utils/debounce-input';

@Component({
  selector: 'debounce-input-enter-example',
  imports: [TxButton, TxInput, TxDebounceInput],
  template: `
    <div class="stack">
      <input
        txInput
        txDebounceInput
        #debounce="txDebounceInput"
        [debounceTime]="3000"
        placeholder="Type, then press Enter"
        aria-label="Note"
        (debounceValue)="saved.set($event)"
      />
      <div class="flex">
        <button txButton label="Save now" size="small" (click)="debounce.flush()"></button>
        <button
          txButton
          label="Cancel"
          size="small"
          severity="secondary"
          (click)="debounce.cancel()"
        ></button>
      </div>
      <span class="hint">Saved: {{ saved() || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DebounceInputEnterExample {
  readonly saved = signal('');
}
