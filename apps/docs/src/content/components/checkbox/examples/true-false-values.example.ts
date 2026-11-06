import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';

@Component({
  selector: 'checkbox-true-false-values-example',
  imports: [FormsModule, TxCheckbox],
  template: `
    <tx-checkbox
      label="Public profile"
      trueValue="public"
      falseValue="private"
      [(ngModel)]="visibility"
    />
    <p class="hint">Value: {{ visibility }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxTrueFalseValuesExample {
  visibility = 'private';
}
