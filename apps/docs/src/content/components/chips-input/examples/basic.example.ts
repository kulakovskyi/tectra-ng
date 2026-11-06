import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';

@Component({
  selector: 'chips-input-basic-example',
  imports: [TxChipsInput, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-chips-input [formControl]="keywords" [placeholder]="'Keywords'" />
      <span class="hint">Value: {{ keywords.value?.join(' · ') || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputBasicExample {
  readonly keywords = new FormControl<string[]>(['design', 'tokens']);
}
