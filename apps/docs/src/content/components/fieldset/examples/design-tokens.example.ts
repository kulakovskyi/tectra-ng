import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFieldset } from '@tectra/ui/fieldset';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'fieldset-design-tokens-example',
  imports: [TxFieldset, TxInput],
  template: `
    <tx-fieldset
      legend="Notes"
      [dt]="{ root: { borderRadius: '4px', background: 'transparent', legendFontWeight: '500' } }"
    >
      <input txInput aria-label="Note" placeholder="Note" class="input" />
    </tx-fieldset>
  `,
  styles: `
    .input {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldsetDesignTokensExample {}
