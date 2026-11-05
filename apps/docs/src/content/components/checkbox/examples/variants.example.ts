import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCheckbox } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-variants-example',
  imports: [TxCheckbox],
  template: `
    <div class="row">
      <tx-checkbox label="Outlined" [binary]="true" />
      <tx-checkbox variant="filled" label="Filled" [binary]="true" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxVariantsExample {}
