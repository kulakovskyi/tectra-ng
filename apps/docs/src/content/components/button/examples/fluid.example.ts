import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFluid } from '@tectra/core/fluid';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-fluid-example',
  imports: [TxButton, TxFluid],
  template: `
    <div class="stack">
      <button txButton [fluid]="true">One fluid button</button>
      <tx-fluid class="footer">
        <button txButton [severity]="'secondary'">Cancel</button>
        <button txButton>Confirm</button>
      </tx-fluid>
    </div>
  `,
  styles: `
    .footer {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonFluidExample {}
