import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFieldset } from '@tectra/ui/fieldset';
import { TxIcon } from '@tectra/icons';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'fieldset-legend-template-example',
  imports: [TxFieldset, TxIcon, TxInput],
  template: `
    <tx-fieldset [toggleable]="true">
      <span txFieldsetLegend class="legend"><tx-icon name="lock" /> Security</span>
      <input
        txInput
        aria-label="Recovery email"
        placeholder="Recovery email"
        type="email"
        class="input"
      />
    </tx-fieldset>
  `,
  styles: `
    .legend {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .input {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldsetLegendTemplateExample {}
