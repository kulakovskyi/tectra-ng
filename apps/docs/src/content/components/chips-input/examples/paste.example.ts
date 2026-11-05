import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInput } from '@tectra/ui/chips-input';

@Component({
  selector: 'chips-input-paste-example',
  imports: [TxChipsInput, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-chips-input
        [formControl]="domains"
        [separator]="separator"
        [showClear]="true"
        [placeholder]="'Domains'"
      />
      <span class="hint">{{ domains.value?.length ?? 0 }} domains</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputPasteExample {
  readonly separator = /[\s,;]+/;
  readonly domains = new FormControl<string[]>(['example.com', 'example.org']);
}
