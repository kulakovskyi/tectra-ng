import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCheckbox } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-indeterminate-example',
  imports: [TxCheckbox],
  template: `<tx-checkbox label="Some files selected" [(indeterminate)]="mixed" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxIndeterminateExample {
  mixed = true;
}
