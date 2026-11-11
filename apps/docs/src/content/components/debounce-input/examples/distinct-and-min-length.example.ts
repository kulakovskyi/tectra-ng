import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxDebounceInput } from '@tectra-ng/utils/debounce-input';

@Component({
  selector: 'debounce-input-distinct-and-min-length-example',
  imports: [TxInput, TxDebounceInput],
  template: `
    <div class="stack">
      <input
        txInput
        txDebounceInput
        distinct
        [debounceTime]="500"
        [minLength]="3"
        placeholder="At least 3 characters"
        aria-label="Domain"
        (debounceValue)="log.update((items) => [value($event), ...items].slice(0, 5))"
      />
      <span class="hint">Reported: {{ log().join(' · ') || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DebounceInputDistinctAndMinLengthExample {
  readonly log = signal<string[]>([]);

  value(text: string): string {
    return text ? `“${text}”` : 'empty';
  }
}
