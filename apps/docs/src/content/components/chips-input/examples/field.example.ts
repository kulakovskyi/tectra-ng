import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';
import { TxFloatLabel } from '@tectra-ng/ui/label';

@Component({
  selector: 'chips-input-field-example',
  imports: [TxField, TxChipsInput, TxFloatLabel, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-field [label]="'Stop words'" [hint]="'Pages with these words are skipped'">
        <tx-chips-input [formControl]="words" />
      </tx-field>
      <tx-float-label>
        <tx-chips-input [inputId]="'chips-input-labels'" />
        <label for="chips-input-labels">Labels</label>
      </tx-float-label>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputFieldExample {
  readonly words = new FormControl<string[]>(['draft']);
}
