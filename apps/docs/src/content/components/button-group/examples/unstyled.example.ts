import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-unstyled-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group [unstyled]="true" class="spaced" aria-label="Spaced actions">
      <button txButton [icon]="'check'">Save</button>
      <button txButton [icon]="'trash'">Delete</button>
      <button txButton [icon]="'times'">Cancel</button>
    </tx-button-group>
  `,
  styles: `
    .spaced {
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupUnstyledExample {}
