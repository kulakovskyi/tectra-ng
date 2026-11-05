import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCheckbox } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-sizes-example',
  imports: [TxCheckbox],
  template: `
    <div class="row">
      <tx-checkbox size="small" label="Small" [binary]="true" />
      <tx-checkbox label="Medium" [binary]="true" />
      <tx-checkbox size="large" label="Large" [binary]="true" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxSizesExample {}
